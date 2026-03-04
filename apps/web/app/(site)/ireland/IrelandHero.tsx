"use client"

import HeroAdvanced from '@/components/HeroAdvanced'
import { formatPrice } from '@/lib/configurator/calculations'

const eurStartingPrice = formatPrice(18500, 'IE')

export default function IrelandHero() {
  return (
    <HeroAdvanced
      title="Premium British Horseboxes, Delivered to Ireland"
      subtitle={`3.5 Tonne Range From ${eurStartingPrice}`}
      description="Handcrafted in Norfolk, delivered direct to your door in Ireland. Drive on a standard car licence. Two models to suit every budget."
      primaryCTA={{
        text: "View 3.5t Range",
        href: "#models",
      }}
      secondaryCTA={{
        text: "Start Configuring",
        href: "/configurator",
      }}
      media={[
        { type: 'image', src: '/models/professional-35/02.webp' },
        { type: 'image', src: '/models/principle-35/02.webp' },
      ]}
      overlay="gradient"
      height="full"
      parallax
    />
  )
}
