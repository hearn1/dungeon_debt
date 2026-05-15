public class ShopOffer
{
    public ShopOffer(HeroDefinition hero, int hireCost)
        : this(hero, hireCost, HeroTier.Bronze)
    {
    }

    public ShopOffer(HeroDefinition hero, int hireCost, HeroTier tier)
    {
        Hero = hero;
        HireCost = hireCost;
        Tier = tier;
        Purchased = false;
    }

    public HeroDefinition Hero { get; set; }
    public int HireCost { get; set; }
    public HeroTier Tier { get; set; }
    public bool Purchased { get; set; }
}
