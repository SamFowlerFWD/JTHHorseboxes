-- Vector Search Functions and Additional Components for JTH
-- =====================================================
-- VECTOR SEARCH FUNCTIONS
-- =====================================================

-- Function to search knowledge base articles using vector similarity
CREATE OR REPLACE FUNCTION search_kb_articles(
    query_embedding vector(1536),
    match_threshold FLOAT DEFAULT 0.7,
    match_count INT DEFAULT 10
)
RETURNS TABLE (
    article_id UUID,
    title TEXT,
    content TEXT,
    category_id UUID,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT ON (ka.id)
        ka.id as article_id,
        ka.title,
        ke.content,
        ka.category_id,
        1 - (ke.embedding <=> query_embedding) as similarity
    FROM kb_embeddings ke
    JOIN kb_articles ka ON ke.article_id = ka.id
    WHERE ka.is_published = true
        AND 1 - (ke.embedding <=> query_embedding) > match_threshold
    ORDER BY ka.id, similarity DESC
    LIMIT match_count;
END;
$$;

-- Function to search FAQs using text search
CREATE OR REPLACE FUNCTION search_faqs(
    search_query TEXT,
    match_count INT DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    question TEXT,
    answer TEXT,
    category VARCHAR(100),
    rank FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.id,
        f.question,
        f.answer,
        f.category,
        ts_rank(
            to_tsvector('english', f.question || ' ' || f.answer),
            plainto_tsquery('english', search_query)
        ) as rank
    FROM faqs f
    WHERE f.is_published = true
        AND to_tsvector('english', f.question || ' ' || f.answer) @@ plainto_tsquery('english', search_query)
    ORDER BY rank DESC
    LIMIT match_count;
END;
$$;

-- =====================================================
-- AUDIT LOGGING TRIGGERS
-- =====================================================

-- Enhanced audit logging function
CREATE OR REPLACE FUNCTION audit_log_trigger()
RETURNS TRIGGER AS $$
DECLARE
    old_data JSONB;
    new_data JSONB;
    user_id UUID;
BEGIN
    -- Get the current user ID from the session
    user_id := COALESCE(
        current_setting('app.current_user_id', true)::UUID,
        auth.uid()
    );

    -- Prepare old and new data
    IF TG_OP = 'DELETE' THEN
        old_data := to_jsonb(OLD);
        new_data := NULL;
    ELSIF TG_OP = 'UPDATE' THEN
        old_data := to_jsonb(OLD);
        new_data := to_jsonb(NEW);
    ELSIF TG_OP = 'INSERT' THEN
        old_data := NULL;
        new_data := to_jsonb(NEW);
    END IF;

    -- Insert audit log
    INSERT INTO activity_logs (
        entity_type,
        entity_id,
        action,
        performed_by,
        details,
        created_at
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        user_id,
        jsonb_build_object(
            'old', old_data,
            'new', new_data,
            'changed_fields', CASE 
                WHEN TG_OP = 'UPDATE' THEN (
                    SELECT jsonb_object_agg(key, new_data->key)
                    FROM jsonb_each(new_data)
                    WHERE old_data->key IS DISTINCT FROM new_data->key
                )
                ELSE NULL
            END
        ),
        NOW()
    );

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to critical tables
CREATE TRIGGER audit_quotes_trigger
    AFTER INSERT OR UPDATE OR DELETE ON quotes
    FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();

CREATE TRIGGER audit_orders_trigger
    AFTER INSERT OR UPDATE OR DELETE ON orders
    FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();

CREATE TRIGGER audit_production_jobs_trigger
    AFTER INSERT OR UPDATE OR DELETE ON production_jobs
    FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();

CREATE TRIGGER audit_leads_trigger
    AFTER INSERT OR UPDATE OR DELETE ON leads
    FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();

-- =====================================================
-- BUSINESS LOGIC FUNCTIONS
-- =====================================================

-- Function to calculate lead score based on activities
CREATE OR REPLACE FUNCTION calculate_lead_score(lead_id UUID)
RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 0;
    lead_record RECORD;
    quote_count INTEGER;
    days_since_created INTEGER;
BEGIN
    -- Get lead details
    SELECT * INTO lead_record FROM leads WHERE id = lead_id;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    -- Base score by stage
    score := CASE lead_record.stage
        WHEN 'inquiry' THEN 10
        WHEN 'qualification' THEN 20
        WHEN 'specification' THEN 40
        WHEN 'quotation' THEN 60
        WHEN 'negotiation' THEN 80
        WHEN 'closed_won' THEN 100
        ELSE 0
    END;
    
    -- Add points for quotes
    SELECT COUNT(*) INTO quote_count FROM quotes WHERE quotes.lead_id = lead_id;
    score := score + (quote_count * 10);
    
    -- Add points for recent activity
    days_since_created := EXTRACT(DAY FROM NOW() - lead_record.created_at);
    IF days_since_created <= 7 THEN
        score := score + 10;
    ELSIF days_since_created <= 30 THEN
        score := score + 5;
    END IF;
    
    -- Cap score at 100
    IF score > 100 THEN
        score := 100;
    END IF;
    
    -- Update lead score
    UPDATE leads SET score = score WHERE id = lead_id;
    
    RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Function to get production job timeline
CREATE OR REPLACE FUNCTION get_production_timeline(job_id UUID)
RETURNS TABLE (
    stage_name VARCHAR(100),
    stage_order INTEGER,
    status VARCHAR(50),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    estimated_hours INTEGER,
    actual_hours INTEGER,
    completion_percentage INTEGER,
    assigned_to_name TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ps.stage_name,
        ps.stage_order,
        ps.status,
        ps.started_at,
        ps.completed_at,
        ps.estimated_hours,
        ps.actual_hours,
        ps.completion_percentage,
        u.full_name as assigned_to_name
    FROM production_stages ps
    LEFT JOIN users u ON ps.assigned_to = u.id
    WHERE ps.job_id = get_production_timeline.job_id
    ORDER BY ps.stage_order;
END;
$$;

-- Function to check inventory levels and create alerts
CREATE OR REPLACE FUNCTION check_inventory_levels()
RETURNS TABLE (
    item_id UUID,
    sku VARCHAR(100),
    name VARCHAR(255),
    current_stock DECIMAL(10, 2),
    min_stock_level DECIMAL(10, 2),
    reorder_point DECIMAL(10, 2),
    alert_type VARCHAR(20)
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ii.id as item_id,
        ii.sku,
        ii.name,
        ii.current_stock,
        ii.min_stock_level,
        ii.reorder_point,
        CASE 
            WHEN ii.current_stock <= 0 THEN 'out_of_stock'
            WHEN ii.current_stock <= ii.min_stock_level THEN 'critical'
            WHEN ii.current_stock <= ii.reorder_point THEN 'reorder'
            ELSE 'ok'
        END as alert_type
    FROM inventory_items ii
    WHERE ii.is_active = true
        AND (ii.current_stock <= ii.reorder_point OR ii.current_stock <= 0)
    ORDER BY 
        CASE 
            WHEN ii.current_stock <= 0 THEN 1
            WHEN ii.current_stock <= ii.min_stock_level THEN 2
            ELSE 3
        END,
        ii.current_stock ASC;
END;
$$;

-- =====================================================
-- VIEWS FOR DASHBOARDS
-- =====================================================

-- Customer Portal View - My Orders
CREATE OR REPLACE VIEW v_customer_orders AS
SELECT 
    o.id,
    o.order_number,
    o.status,
    o.total_amount,
    o.deposit_paid,
    o.balance_due,
    o.payment_status,
    o.delivery_date,
    o.created_at,
    q.quote_number,
    pm.name as model_name,
    pm.category as model_category,
    pj.job_number,
    pj.status as production_status,
    pj.current_stage,
    pj.target_date as production_target_date,
    (
        SELECT COUNT(*)
        FROM build_updates bu
        WHERE bu.job_id = pj.id AND bu.is_customer_visible = true
    ) as update_count
FROM orders o
LEFT JOIN quotes q ON o.quote_id = q.id
LEFT JOIN product_models pm ON q.model_id = pm.id
LEFT JOIN production_jobs pj ON pj.order_id = o.id;

-- Sales Dashboard - Pipeline Summary
CREATE OR REPLACE VIEW v_sales_dashboard AS
SELECT 
    stage,
    COUNT(*) as lead_count,
    COUNT(DISTINCT organization_id) as organization_count,
    AVG(score) as avg_score,
    SUM(
        SELECT MAX(total_amount) 
        FROM quotes 
        WHERE quotes.lead_id = leads.id
    ) as total_pipeline_value,
    AVG(
        EXTRACT(DAY FROM NOW() - created_at)
    ) as avg_age_days
FROM leads
WHERE status NOT IN ('closed_won', 'closed_lost')
GROUP BY stage;

-- Production Capacity View
CREATE OR REPLACE VIEW v_production_capacity AS
WITH stage_workload AS (
    SELECT 
        DATE_TRUNC('week', COALESCE(ps.started_at, pj.start_date)) as week_start,
        SUM(ps.estimated_hours) as estimated_hours,
        SUM(ps.actual_hours) as actual_hours,
        COUNT(DISTINCT pj.id) as job_count
    FROM production_jobs pj
    JOIN production_stages ps ON ps.job_id = pj.id
    WHERE pj.status NOT IN ('completed', 'cancelled')
    GROUP BY week_start
)
SELECT 
    week_start,
    estimated_hours,
    actual_hours,
    job_count,
    -- Assuming 40 hour work week, 5 workers
    (estimated_hours / 200.0 * 100) as capacity_utilization_percent
FROM stage_workload
ORDER BY week_start;

-- =====================================================
-- STORED PROCEDURES
-- =====================================================

-- Procedure to convert lead to order
CREATE OR REPLACE FUNCTION convert_quote_to_order(
    quote_id UUID,
    deposit_amount DECIMAL(10, 2) DEFAULT 0
)
RETURNS UUID AS $$
DECLARE
    new_order_id UUID;
    order_num TEXT;
    quote_record RECORD;
BEGIN
    -- Get quote details
    SELECT * INTO quote_record FROM quotes WHERE id = quote_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Quote not found';
    END IF;
    
    IF quote_record.status != 'accepted' THEN
        RAISE EXCEPTION 'Quote must be accepted before converting to order';
    END IF;
    
    -- Generate order number
    order_num := generate_order_number();
    
    -- Create order
    INSERT INTO orders (
        id,
        order_number,
        quote_id,
        organization_id,
        contact_id,
        status,
        total_amount,
        deposit_paid,
        balance_due,
        payment_status,
        created_at
    ) VALUES (
        uuid_generate_v4(),
        order_num,
        quote_id,
        quote_record.organization_id,
        quote_record.contact_id,
        'pending',
        quote_record.total_amount,
        deposit_amount,
        quote_record.total_amount - deposit_amount,
        CASE WHEN deposit_amount > 0 THEN 'partial' ELSE 'pending' END,
        NOW()
    ) RETURNING id INTO new_order_id;
    
    -- Update lead status
    UPDATE leads 
    SET stage = 'closed_won', status = 'won'
    WHERE id = quote_record.lead_id;
    
    -- Create production job
    INSERT INTO production_jobs (
        job_number,
        order_id,
        model_id,
        configuration,
        status,
        priority,
        created_at
    ) VALUES (
        'JOB-' || order_num,
        new_order_id,
        quote_record.model_id,
        quote_record.configuration,
        'scheduled',
        0,
        NOW()
    );
    
    RETURN new_order_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PERFORMANCE INDEXES
-- =====================================================

-- Text search indexes
CREATE INDEX idx_kb_articles_text_search ON kb_articles 
    USING gin(to_tsvector('english', title || ' ' || COALESCE(content, '') || ' ' || COALESCE(summary, '')));

CREATE INDEX idx_faqs_text_search ON faqs 
    USING gin(to_tsvector('english', question || ' ' || answer));

-- Additional performance indexes
CREATE INDEX idx_quotes_created_at ON quotes(created_at DESC);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_production_jobs_target_date ON production_jobs(target_date);
CREATE INDEX idx_activity_logs_entity_created ON activity_logs(entity_type, entity_id, created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES (Additional)
-- =====================================================

-- Knowledge base is public read
CREATE POLICY kb_public_read ON kb_articles 
    FOR SELECT USING (is_published = true);

CREATE POLICY kb_admin_all ON kb_articles 
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'manager'))
    );

-- FAQs are public read
CREATE POLICY faq_public_read ON faqs 
    FOR SELECT USING (is_published = true);

CREATE POLICY faq_admin_all ON faqs 
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'manager'))
    );

-- Inventory management for workshop staff
CREATE POLICY inventory_workshop ON inventory_items 
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'manager', 'workshop'))
    );

CREATE POLICY stock_movements_workshop ON stock_movements 
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'manager', 'workshop'))
    );

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get next available build slot
CREATE OR REPLACE FUNCTION get_next_build_slot(
    model_id UUID,
    earliest_date DATE DEFAULT CURRENT_DATE
)
RETURNS DATE AS $$
DECLARE
    model_record RECORD;
    current_capacity INTEGER;
    slot_date DATE;
    max_concurrent_builds INTEGER := 5; -- Configurable
BEGIN
    -- Get model build time
    SELECT * INTO model_record FROM product_models WHERE id = model_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Model not found';
    END IF;
    
    slot_date := earliest_date;
    
    -- Find first available slot
    LOOP
        -- Count jobs in progress for this date range
        SELECT COUNT(*) INTO current_capacity
        FROM production_jobs
        WHERE status IN ('scheduled', 'in_progress')
            AND start_date <= slot_date
            AND target_date >= slot_date;
        
        IF current_capacity < max_concurrent_builds THEN
            RETURN slot_date;
        END IF;
        
        slot_date := slot_date + INTERVAL '1 week';
        
        -- Prevent infinite loop
        IF slot_date > earliest_date + INTERVAL '52 weeks' THEN
            RAISE EXCEPTION 'No available build slots in the next year';
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to send notification (placeholder for real implementation)
CREATE OR REPLACE FUNCTION send_notification(
    user_id UUID,
    notification_type TEXT,
    title TEXT,
    message TEXT,
    metadata JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
    -- This would integrate with your notification system
    -- For now, just log to activity
    INSERT INTO activity_logs (
        entity_type,
        entity_id,
        action,
        performed_by,
        details,
        created_at
    ) VALUES (
        'notification',
        user_id,
        notification_type,
        user_id,
        jsonb_build_object(
            'title', title,
            'message', message,
            'metadata', metadata
        ),
        NOW()
    );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- INITIAL PERMISSIONS
-- =====================================================

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION search_kb_articles TO authenticated;
GRANT EXECUTE ON FUNCTION search_faqs TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_lead_score TO authenticated;
GRANT EXECUTE ON FUNCTION get_production_timeline TO authenticated;
GRANT EXECUTE ON FUNCTION check_inventory_levels TO authenticated;
GRANT EXECUTE ON FUNCTION convert_quote_to_order TO authenticated;
GRANT EXECUTE ON FUNCTION get_next_build_slot TO authenticated;

-- Grant select on views
GRANT SELECT ON v_customer_orders TO authenticated;
GRANT SELECT ON v_sales_pipeline TO authenticated;
GRANT SELECT ON v_sales_dashboard TO authenticated;
GRANT SELECT ON v_production_dashboard TO authenticated;
GRANT SELECT ON v_production_capacity TO authenticated;
GRANT SELECT ON v_inventory_status TO authenticated;