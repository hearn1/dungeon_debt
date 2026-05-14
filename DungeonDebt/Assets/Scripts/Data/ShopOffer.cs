public class ShopOffer
{
    public ShopOffer(HeroDefinition hero, int hireCost)
    {
        Hero = hero;
        HireCost = hireCost;
        Purchased = false;
    }

    public HeroDefinition Hero { get; set; }
    public int HireCost { get; set; }
    public bool Purchased { get; set; }
}
