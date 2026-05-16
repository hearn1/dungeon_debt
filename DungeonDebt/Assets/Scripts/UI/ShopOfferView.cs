using System;
using UnityEngine;
using UnityEngine.UI;

public class ShopOfferView : MonoBehaviour
{
    private const int Padding = 8;
    private const int ButtonHeight = 48;
    private const int CardHeight = 200;

    [SerializeField] private HeroCardView _heroCardView;
    [SerializeField] private Button _hireButton;
    [SerializeField] private Text _hireLabel;
    [SerializeField] private Text _statusLabel;

    private Action _onHireClicked;
    private Font _font;

    public void Initialize(Font font)
    {
        _font = font;
        BuildUi(font);
    }

    public void SetOnHire(Action onHire)
    {
        _onHireClicked = onHire;
    }

    public void Refresh(ShopOffer offer, int playerGold, bool partyFull, bool isUpgrade)
    {
        if (offer == null || offer.Hero == null)
        {
            _heroCardView.Clear();
            _hireLabel.text = "—";
            _hireButton.interactable = false;
            _statusLabel.text = "Empty";
            return;
        }

        _heroCardView.Refresh(offer.Hero, offer.Tier);
        if (isUpgrade)
        {
            _hireLabel.text = "Upgrade (" + offer.HireCost + "g)";
        }
        else if (offer.Tier == HeroTier.Silver)
        {
            _hireLabel.text = "Silver " + offer.HireCost + "g";
        }
        else
        {
            _hireLabel.text = "Hire (" + offer.HireCost + "g)";
        }

        if (offer.Purchased)
        {
            _statusLabel.text = isUpgrade ? "Upgraded" : "Hired";
            _hireButton.interactable = false;
        }
        else if (!isUpgrade && partyFull)
        {
            _statusLabel.text = "Party full";
            _hireButton.interactable = false;
        }
        else if (playerGold < offer.HireCost)
        {
            _statusLabel.text = "Need " + offer.HireCost + "g";
            _hireButton.interactable = false;
        }
        else
        {
            if (isUpgrade)
            {
                _statusLabel.text = BuildUpgradePreview(offer.Hero);
            }
            else if (offer.Tier == HeroTier.Silver)
            {
                _statusLabel.text = "Silver offer";
            }
            else
            {
                _statusLabel.text = string.Empty;
            }
            _hireButton.interactable = true;
        }
    }

    private static string BuildUpgradePreview(HeroDefinition hero)
    {
        if (hero == null)
        {
            return "Merges to Silver";
        }

        int bronzeAttack = HeroEffects.GetTierAdjustedAttack(hero, HeroTier.Bronze);
        int silverAttack = HeroEffects.GetTierAdjustedAttack(hero, HeroTier.Silver);
        int bronzeHealth = HeroEffects.GetTierAdjustedMaxHealth(hero, HeroTier.Bronze);
        int silverHealth = HeroEffects.GetTierAdjustedMaxHealth(hero, HeroTier.Silver);
        int bronzeUpkeep = HeroEffects.GetTierAdjustedUpkeep(hero, HeroTier.Bronze);
        int silverUpkeep = HeroEffects.GetTierAdjustedUpkeep(hero, HeroTier.Silver);

        string firstLine = string.Empty;
        if (silverAttack != bronzeAttack)
        {
            firstLine = "ATK " + bronzeAttack + "->" + silverAttack;
        }

        if (silverHealth != bronzeHealth)
        {
            firstLine = AppendDelta(firstLine, "HP " + bronzeHealth + "->" + silverHealth);
        }

        if (silverUpkeep != bronzeUpkeep)
        {
            firstLine = AppendDelta(firstLine, "Upkeep " + bronzeUpkeep + "->" + silverUpkeep);
        }

        string effectLine = BuildEffectUpgradePreview(hero);
        if (firstLine.Length > 0 && effectLine.Length > 0)
        {
            return firstLine + "\n" + effectLine;
        }

        if (firstLine.Length > 0)
        {
            return firstLine;
        }

        if (effectLine.Length > 0)
        {
            return effectLine;
        }

        return "Merges to Silver";
    }

    private static string AppendDelta(string current, string next)
    {
        if (current.Length == 0)
        {
            return next;
        }

        return current + "  " + next;
    }

    private static string BuildEffectUpgradePreview(HeroDefinition hero)
    {
        switch (hero.EffectId)
        {
            case HeroEffectId.KnightRedirect:
                return "Redirect " + GameRules.BronzeKnightRedirectCount + "->" + GameRules.SilverKnightRedirectCount;
            case HeroEffectId.PriestHeal:
                return "Heal " + GameRules.FrontlineHealAmount + "->" + GameRules.SilverPriestHealAmount;
            case HeroEffectId.BardGoldOnWin:
                return "Win gold " + GameRules.BronzeBardWinGold + "->" + GameRules.SilverBardWinGold;
            case HeroEffectId.EnchanterAdjacent:
                return "Adjacent Damage -> All Damage";
            case HeroEffectId.TreasurerUpkeepReduce:
                return "Top " + GameRules.BronzeTreasurerTargets + " -> Top " + GameRules.SilverTreasurerTargets;
            case HeroEffectId.ApprenticeWizardSupport:
                return "Wizard upkeep -" + GameRules.BronzeApprenticeWizardReduction + "->-" + GameRules.SilverApprenticeWizardReduction;
            default:
                return string.Empty;
        }
    }

    private void BuildUi(Font font)
    {
        RectTransform root = GetComponent<RectTransform>();
        if (root == null)
        {
            root = gameObject.AddComponent<RectTransform>();
        }

        Image background = gameObject.GetComponent<Image>();
        if (background == null)
        {
            background = gameObject.AddComponent<Image>();
        }

        background.color = new Color(0.14f, 0.15f, 0.18f, 1f);
        background.raycastTarget = false;

        GameObject cardObject = new GameObject("HeroCard", typeof(RectTransform));
        RectTransform cardRect = cardObject.GetComponent<RectTransform>();
        cardRect.SetParent(root, false);
        cardRect.anchorMin = new Vector2(0f, 1f);
        cardRect.anchorMax = new Vector2(1f, 1f);
        cardRect.pivot = new Vector2(0.5f, 1f);
        cardRect.offsetMin = new Vector2(Padding, -Padding - CardHeight);
        cardRect.offsetMax = new Vector2(-Padding, -Padding);
        _heroCardView = cardObject.AddComponent<HeroCardView>();
        _heroCardView.Initialize(font);

        _hireButton = CreateButton("HireButton", root, font, "Hire", out _hireLabel);
        RectTransform hireRect = _hireButton.GetComponent<RectTransform>();
        hireRect.anchorMin = new Vector2(0f, 0f);
        hireRect.anchorMax = new Vector2(0.5f, 0f);
        hireRect.pivot = new Vector2(0.5f, 0f);
        hireRect.offsetMin = new Vector2(Padding, Padding);
        hireRect.offsetMax = new Vector2(-Padding, Padding + ButtonHeight);

        _statusLabel = CreateText("Status", root, font, 14, FontStyle.Italic, TextAnchor.MiddleCenter);
        RectTransform statusRect = _statusLabel.rectTransform;
        statusRect.anchorMin = new Vector2(0.5f, 0f);
        statusRect.anchorMax = new Vector2(1f, 0f);
        statusRect.offsetMin = new Vector2(Padding, Padding);
        statusRect.offsetMax = new Vector2(-Padding, Padding + ButtonHeight);

        _hireButton.onClick.AddListener(HandleHireClicked);
    }

    private void OnDestroy()
    {
        if (_hireButton != null)
        {
            _hireButton.onClick.RemoveListener(HandleHireClicked);
        }
    }

    private void HandleHireClicked()
    {
        if (_onHireClicked != null)
        {
            _onHireClicked.Invoke();
        }
    }

    private static Button CreateButton(string objectName, RectTransform parent, Font font, string label, out Text labelText)
    {
        GameObject child = new GameObject(objectName, typeof(RectTransform));
        RectTransform rectTransform = child.GetComponent<RectTransform>();
        rectTransform.SetParent(parent, false);

        Image image = child.AddComponent<Image>();
        image.color = new Color(0.78f, 0.69f, 0.41f, 1f);
        image.raycastTarget = true;

        Button button = child.AddComponent<Button>();
        button.targetGraphic = image;

        labelText = CreateText("Label", rectTransform, font, 18, FontStyle.Bold, TextAnchor.MiddleCenter);
        labelText.text = label;
        labelText.color = new Color(0.08f, 0.08f, 0.09f, 1f);
        RectTransform labelRect = labelText.rectTransform;
        labelRect.anchorMin = Vector2.zero;
        labelRect.anchorMax = Vector2.one;
        labelRect.offsetMin = new Vector2(6f, 4f);
        labelRect.offsetMax = new Vector2(-6f, -4f);
        return button;
    }

    private static Text CreateText(string objectName, RectTransform parent, Font font, int fontSize, FontStyle fontStyle, TextAnchor alignment)
    {
        GameObject child = new GameObject(objectName, typeof(RectTransform));
        RectTransform rectTransform = child.GetComponent<RectTransform>();
        rectTransform.SetParent(parent, false);
        Text textComponent = child.AddComponent<Text>();
        textComponent.font = font;
        textComponent.fontSize = fontSize;
        textComponent.fontStyle = fontStyle;
        textComponent.alignment = alignment;
        textComponent.color = new Color(0.93f, 0.94f, 0.9f, 1f);
        textComponent.horizontalOverflow = HorizontalWrapMode.Wrap;
        textComponent.verticalOverflow = VerticalWrapMode.Truncate;
        textComponent.raycastTarget = false;
        return textComponent;
    }
}
