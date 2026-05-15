using System.Collections.Generic;
using UnityEngine;

public class ShopManager : MonoBehaviour
{
    private const int NoEmptyFormationSlot = -1;

    [SerializeField] private RunManager _runManager;

    private readonly List<ShopOffer> _currentOffers = new List<ShopOffer>();

    public IReadOnlyList<ShopOffer> CurrentOffers
    {
        get { return _currentOffers; }
    }

    public void Initialize(RunManager runManager)
    {
        _runManager = runManager;
    }

    public void GenerateOffers()
    {
        FillAllOffers();
    }

    public bool Reroll()
    {
        RunState run = GetRunState();
        if (run == null || run.Gold < GameRules.RerollCost)
        {
            return false;
        }

        run.Gold -= GameRules.RerollCost;
        run.RerollCount += 1;
        FillAllOffers();
        return true;
    }

    public bool Hire(int offerIndex)
    {
        if (offerIndex < 0 || offerIndex >= _currentOffers.Count)
        {
            return false;
        }

        ShopOffer offer = _currentOffers[offerIndex];
        if (offer == null || offer.Purchased)
        {
            return false;
        }

        RunState run = GetRunState();
        if (run == null)
        {
            return false;
        }

        if (run.Party.Count >= GameRules.MaxPartySize)
        {
            return false;
        }

        if (run.Gold < offer.HireCost)
        {
            return false;
        }

        int formationSlot = FindFirstEmptyFormationSlot(run);
        if (formationSlot == NoEmptyFormationSlot)
        {
            return false;
        }

        run.Gold -= offer.HireCost;
        run.Party.Add(new HeroInstance(offer.Hero, formationSlot));
        offer.Purchased = true;
        return true;
    }

    public bool Fire(int partyIndex)
    {
        RunState run = GetRunState();
        if (run == null)
        {
            return false;
        }

        if (partyIndex < 0 || partyIndex >= run.Party.Count)
        {
            return false;
        }

        run.Party.RemoveAt(partyIndex);
        run.Gold += GameRules.FireRefund;

        for (int i = 0; i < run.Party.Count; i++)
        {
            run.Party[i].FormationSlot = i;
        }

        return true;
    }

    private void FillAllOffers()
    {
        _currentOffers.Clear();

        System.Random rng = _runManager != null ? _runManager.Random : null;
        if (rng == null)
        {
            return;
        }

        RunState run = GetRunState();
        HashSet<string> exclude = new HashSet<string>();
        if (run != null)
        {
            for (int i = 0; i < run.Party.Count; i++)
            {
                exclude.Add(run.Party[i].Definition.Id);
            }
        }

        IReadOnlyList<HeroDefinition> allHeroes = DataRepository.AllHeroes;
        List<HeroDefinition> pool = new List<HeroDefinition>();
        for (int i = 0; i < allHeroes.Count; i++)
        {
            if (!exclude.Contains(allHeroes[i].Id))
            {
                pool.Add(allHeroes[i]);
            }
        }

        for (int i = 0; i < GameRules.ShopOfferCount; i++)
        {
            if (pool.Count == 0)
            {
                _currentOffers.Add(null);
                continue;
            }

            int pick = rng.Next(0, pool.Count);
            HeroDefinition hero = pool[pick];
            pool.RemoveAt(pick);
            _currentOffers.Add(new ShopOffer(hero, hero.BaseUpkeep + GameRules.HireCostBonus));
        }
    }

    private RunState GetRunState()
    {
        if (_runManager == null)
        {
            return null;
        }

        return _runManager.CurrentRunState;
    }

    private static int FindFirstEmptyFormationSlot(RunState run)
    {
        if (run == null)
        {
            return NoEmptyFormationSlot;
        }

        for (int slot = 0; slot < GameRules.MaxPartySize; slot++)
        {
            bool occupied = false;
            for (int i = 0; i < run.Party.Count; i++)
            {
                if (run.Party[i].FormationSlot == slot)
                {
                    occupied = true;
                    break;
                }
            }

            if (!occupied)
            {
                return slot;
            }
        }

        return NoEmptyFormationSlot;
    }
}
