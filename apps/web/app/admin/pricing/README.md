# Pricing Management Admin UI

A comprehensive, production-ready admin interface for managing horsebox configurator pricing options.

## Overview

This admin interface provides full CRUD operations for the 86+ pricing options across 7 categories in the horsebox configurator system. Built with modern UI/UX principles using Shadcn components and designed for efficiency and usability.

## File Structure

```
/app/admin/pricing/
├── page.tsx                           # Main pricing management page
├── components/
│   ├── PricingModal.tsx              # Create/Edit modal dialog
│   ├── BulkImportDialog.tsx          # CSV bulk import functionality
│   └── DeleteConfirmDialog.tsx        # Delete confirmation dialog
└── README.md                          # This file
```

## Features

### 1. Main Data Table

- **Comprehensive Display**: Shows all pricing options with key information
- **Columns**:
  - Name (with description preview and SKU)
  - Category (color-coded badges)
  - Model (3.5T/4.5T/7.2T)
  - Price (with per-foot pricing indicator)
  - Weight (color-coded: green <25kg, amber <50kg, red >50kg)
  - Living Area Units (with inch conversion)
  - Status (Available/Unavailable)
  - Actions (dropdown menu)

### 2. Advanced Filtering

- **Search**: Real-time search across name, description, and SKU
- **Model Filter**: Filter by 3.5T, 4.5T, or 7.2T
- **Category Filter**: Filter by 7 categories (exterior, storage, interior, chassis, horse-area, grooms-area, electrical)
- **Availability Filter**: Show available, unavailable, or all options
- **Clear Filters**: One-click filter reset

### 3. Statistics Dashboard

Four-card statistics display:
- Total Options count
- Available options (green highlight)
- Unavailable options
- Filtered results count

### 4. Create/Edit Modal (PricingModal)

**Basic Information Section**:
- Model selection (required)
- Category selection (required)
- Name input (required)
- Description textarea
- SKU input
- Subcategory input

**Pricing Section**:
- Per-foot pricing toggle
- Price input OR Price per foot input
- VAT rate (default 20%)

**Weight & Living Area Section**:
- Weight in kg (with helper text)
- Living area units (1 unit = 6 inches)

**Options Section**:
- Set as default checkbox
- Is available checkbox

**Validation**:
- Required field validation
- Price validation (must be >= 0)
- Weight validation (must be >= 0)
- Living area validation (must be >= 0)
- VAT rate validation (0-100%)

### 5. Bulk Import (BulkImportDialog)

**Features**:
- CSV template download
- Drag-and-drop file upload
- Row-by-row processing with error handling
- Detailed import results:
  - Total rows processed
  - Created count
  - Updated count
  - Failed count with specific errors
- Update existing (with ID) or create new (without ID)

**CSV Format**:
```csv
ID,Model,Category,Subcategory,Name,Description,SKU,Price,Price Per Foot,Weight (kg),Living Area Units,Per Foot Pricing,VAT Rate,Is Default,Is Available
,3.5t,exterior,,Sample Tack Locker,External storage locker,TL-001,750,0,50,4,false,20,false,true
```

### 6. Row Actions Menu

Each row has a dropdown menu with:
- **Edit**: Opens edit modal
- **Duplicate**: Creates a copy with "(Copy)" suffix
- **Enable/Disable**: Toggles availability
- **Delete**: Opens confirmation dialog (with usage check)

### 7. Bulk Export

- **CSV Export**: Export all options with complete data
- **Filename**: `pricing-options-YYYY-MM-DD.csv`
- Includes all fields for easy re-import

### 8. Pagination

- 25 items per page
- Previous/Next navigation
- Current page indicator
- Total results count

## Design Excellence

### UI/UX Features

1. **Modern Shadcn Components**:
   - Dialog modals with smooth animations
   - Table with hover states
   - Badge variants for visual categorization
   - Dropdown menus with keyboard navigation
   - Form inputs with proper accessibility

2. **Visual Indicators**:
   - **Category Colors**: Each category has unique color coding
     - Exterior: Blue
     - Storage: Amber
     - Interior: Purple
     - Chassis: Slate
     - Horse Area: Green
     - Grooms Area: Pink
     - Electrical: Yellow
   - **Weight Colors**: Traffic light system (green/amber/red)
   - **Status Badges**: Green for available, grey for unavailable
   - **Per-foot Pricing**: Special blue badge indicator

3. **Responsive Design**:
   - Mobile-first approach
   - Adaptive grid layouts
   - Scrollable table on small screens
   - Touch-friendly action buttons

4. **Accessibility**:
   - ARIA labels on all interactive elements
   - Keyboard navigation support
   - Focus indicators
   - Screen reader compatibility
   - Semantic HTML structure

5. **User Feedback**:
   - Toast notifications for all actions
   - Loading states with spinners
   - Optimistic UI updates
   - Detailed error messages
   - Confirmation dialogs for destructive actions

### Performance Optimizations

- Client-side filtering (instant results)
- Pagination (reduced DOM nodes)
- Optimistic updates (perceived performance)
- Efficient re-renders with proper state management

## API Integration

### Endpoints Used

```typescript
// GET all options (with optional filters)
GET /api/ops/pricing?model=3.5t&category=exterior&search=tack

// CREATE new option
POST /api/ops/pricing
Body: PricingOption (without id, created_at, updated_at)

// UPDATE option
PATCH /api/ops/pricing/[id]
Body: Partial<PricingOption>

// DELETE option
DELETE /api/ops/pricing/[id]
```

### Request/Response Handling

- Success/error handling with toast notifications
- Automatic data refresh after mutations
- Loading states during async operations
- Error boundary protection

## Data Model

```typescript
interface PricingOption {
  id: string
  created_at: string
  updated_at: string
  model: string                    // 3.5t | 4.5t | 7.2t
  category: string                 // exterior | storage | interior | chassis | horse-area | grooms-area | electrical
  subcategory: string | null
  name: string
  description: string | null
  sku: string | null
  price: number
  price_per_foot: number
  weight_kg: number                // NEW: Weight tracking
  living_area_units: number        // NEW: Living area tracking (1 unit = 6 inches)
  per_foot_pricing: boolean        // NEW: Per-foot pricing flag
  vat_rate: number
  is_default: boolean
  is_available: boolean
  dependencies: any | null
}
```

## Usage Examples

### Adding a New Option

1. Click "Add New Option" button
2. Fill in required fields (Name, Model, Category)
3. Enter pricing information
4. Set weight and living area units
5. Configure options (default, availability)
6. Click "Create Option"

### Editing an Option

1. Click the three-dot menu on any row
2. Select "Edit"
3. Modify fields as needed
4. Click "Update Option"

### Bulk Import

1. Click "Import CSV" button
2. Download template (optional)
3. Prepare CSV file with data
4. Drag and drop or select file
5. Review import results
6. Check for any errors

### Filtering Options

1. Use search bar for text search
2. Select model from dropdown
3. Select category from dropdown
4. Select availability status
5. Click "Clear Filters" to reset

### Duplicating an Option

1. Find the option to duplicate
2. Click three-dot menu
3. Select "Duplicate"
4. Edit the new option (has "(Copy)" suffix)

## Best Practices Implemented

### Code Quality

- TypeScript strict mode compliance
- Proper type definitions
- Error handling with try/catch
- Loading state management
- Form validation

### Security

- Input sanitization
- XSS prevention (React escaping)
- CSRF protection via API routes
- Authentication checks (admin only)
- Usage validation before delete

### Maintainability

- Component separation of concerns
- Reusable UI components
- Clear naming conventions
- Comprehensive comments
- README documentation

### Testing Considerations

The UI is designed to be testable:
- Semantic HTML for easy selection
- Data attributes for test hooks (can be added)
- Predictable state management
- Clear component boundaries
- Mockable API calls

## Future Enhancements

Potential improvements:
1. **History View**: Link to pricing history page
2. **Advanced Filters**: Date range, price range
3. **Sort Options**: Multi-column sorting
4. **Bulk Actions**: Select multiple for delete/update
5. **Image Upload**: Add product images
6. **Dependencies UI**: Visual dependency editor
7. **Export Formats**: PDF, Excel support
8. **Audit Trail**: Show who made changes
9. **Scheduled Pricing**: Future price updates
10. **Approval Workflow**: Multi-step approval

## Keyboard Shortcuts

(Not yet implemented, but recommended):
- `Ctrl/Cmd + N`: New option
- `Ctrl/Cmd + F`: Focus search
- `Ctrl/Cmd + E`: Export CSV
- `Escape`: Close modal
- `Arrow Keys`: Navigate table
- `Enter`: Edit selected row

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Metrics

Target performance:
- Initial load: < 1.5s
- Filter response: < 100ms (client-side)
- Modal open: < 200ms
- API calls: < 500ms (server-dependent)

## Accessibility Compliance

- WCAG 2.1 AA compliant
- Keyboard navigable
- Screen reader tested
- Color contrast ratios met
- Focus indicators visible
- ARIA labels present

## Contributing

When extending this UI:
1. Follow existing component patterns
2. Use Shadcn components when possible
3. Maintain TypeScript types
4. Add proper error handling
5. Include loading states
6. Update this README

## Support

For issues or questions:
- Check API documentation in `/api/ops/pricing/`
- Review type definitions in `/lib/configurator/types.ts`
- Consult Shadcn UI docs: https://ui.shadcn.com
- Review existing admin pages for patterns

---

**Built with**: Next.js 14, React, TypeScript, Shadcn UI, Tailwind CSS, Lucide Icons

**Last Updated**: November 2025

**Version**: 1.0.0
