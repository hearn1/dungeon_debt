using UnityEngine;
using UnityEngine.UI;

public class HeroCardView : MonoBehaviour
{
    private const int Padding = 10;
    private const int RoleBandWidth = 6;
    private const int TierSlotSize = 26;
    private const int RoleBadgeHeight = 20;
    private const int RoleBadgeWidth = 84;
    private const int NameFontSize = 20;
    private const int RoleBadgeFontSize = 12;
    private const int StatsFontSize = 16;
    private const int UpkeepFontSize = 20;
    private const int EffectFontSize = 13;

    [SerializeField] private Image _roleBand;
    [SerializeField] private Image _roleBadge;
    [SerializeField] private Text _roleBadgeText;
    [SerializeField] private Image _tierSlotOutline;
    [SerializeField] private Text _nameText;
    [SerializeField] private Text _statsText;
    [SerializeField] private Text _upkeepText;
    [SerializeField] private Text _effectText;

    public void Initialize(Font font)
    {
        BuildUi(font);
        Clear();
    }

    public void Refresh(HeroDefinition hero)
    {
        if (hero == null)
        {
            Clear();
            return;
        }

        Color roleColor = GameRules.GetRoleColor(hero.Role);
        _roleBand.color = roleColor;
        _roleBand.enabled = true;
        _roleBadge.color = roleColor;
        _roleBadge.enabled = true;
        _roleBadgeText.text = hero.Role.ToString();
        _roleBadgeText.enabled = true;
        _tierSlotOutline.enabled = true;

        _nameText.text = hero.DisplayName;
        _statsText.text = "ATK " + hero.BaseAttack + "    HP " + hero.BaseHealth;
        _upkeepText.text = "Upkeep " + hero.BaseUpkeep + "g";
        _effectText.text = hero.EffectDescription;
    }

    public void Clear()
    {
        if (_roleBand != null)
        {
            _roleBand.enabled = false;
        }
        if (_roleBadge != null)
        {
            _roleBadge.enabled = false;
        }
        if (_roleBadgeText != null)
        {
            _roleBadgeText.text = string.Empty;
            _roleBadgeText.enabled = false;
        }
        if (_tierSlotOutline != null)
        {
            _tierSlotOutline.enabled = false;
        }
        if (_nameText != null)
        {
            _nameText.text = string.Empty;
        }
        if (_statsText != null)
        {
            _statsText.text = string.Empty;
        }
        if (_upkeepText != null)
        {
            _upkeepText.text = string.Empty;
        }
        if (_effectText != null)
        {
            _effectText.text = string.Empty;
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

        background.color = new Color(0.18f, 0.19f, 0.23f, 1f);
        background.raycastTarget = false;

        // Left-edge role color band, full height.
        _roleBand = CreateImage("RoleBand", root);
        RectTransform bandRect = _roleBand.rectTransform;
        bandRect.anchorMin = new Vector2(0f, 0f);
        bandRect.anchorMax = new Vector2(0f, 1f);
        bandRect.pivot = new Vector2(0f, 0.5f);
        bandRect.offsetMin = new Vector2(0f, 0f);
        bandRect.offsetMax = new Vector2(RoleBandWidth, 0f);

        // Reserved tier-badge slot, top-right corner. Empty outlined neutral
        // rectangle (no Bronze tint per slice scope; M9 will fill it).
        _tierSlotOutline = CreateOutlineImage("TierSlot", root, GameRules.ReservedTierSlotOutlineColor);
        RectTransform tierRect = _tierSlotOutline.rectTransform;
        tierRect.anchorMin = new Vector2(1f, 1f);
        tierRect.anchorMax = new Vector2(1f, 1f);
        tierRect.pivot = new Vector2(1f, 1f);
        tierRect.anchoredPosition = new Vector2(-Padding, -Padding);
        tierRect.sizeDelta = new Vector2(TierSlotSize, TierSlotSize);

        int contentLeft = RoleBandWidth + Padding;
        int contentRight = -Padding;
        int nameRightOffset = -Padding - TierSlotSize - 6;

        _nameText = CreateText("Name", root, font, NameFontSize, FontStyle.Bold, TextAnchor.UpperLeft);
        SetAnchored(_nameText.rectTransform, contentLeft, -Padding - 26, nameRightOffset, -Padding);

        // Role badge chip below the name.
        _roleBadge = CreateImage("RoleBadge", root);
        RectTransform badgeRect = _roleBadge.rectTransform;
        badgeRect.anchorMin = new Vector2(0f, 1f);
        badgeRect.anchorMax = new Vector2(0f, 1f);
        badgeRect.pivot = new Vector2(0f, 1f);
        badgeRect.anchoredPosition = new Vector2(contentLeft, -(Padding + 30));
        badgeRect.sizeDelta = new Vector2(RoleBadgeWidth, RoleBadgeHeight);

        _roleBadgeText = CreateText("RoleBadgeText", _roleBadge.rectTransform, font, RoleBadgeFontSize, FontStyle.Bold, TextAnchor.MiddleCenter);
        _roleBadgeText.color = new Color(0.97f, 0.97f, 0.95f, 1f);
        RectTransform badgeTextRect = _roleBadgeText.rectTransform;
        badgeTextRect.anchorMin = Vector2.zero;
        badgeTextRect.anchorMax = Vector2.one;
        badgeTextRect.offsetMin = new Vector2(2f, 1f);
        badgeTextRect.offsetMax = new Vector2(-2f, -1f);

        _statsText = CreateText("Stats", root, font, StatsFontSize, FontStyle.Normal, TextAnchor.UpperLeft);
        SetAnchored(_statsText.rectTransform, contentLeft, -Padding - 78, contentRight, -Padding - 56);

        _upkeepText = CreateText("Upkeep", root, font, UpkeepFontSize, FontStyle.Bold, TextAnchor.UpperLeft);
        _upkeepText.color = new Color(0.95f, 0.85f, 0.45f, 1f);
        SetAnchored(_upkeepText.rectTransform, contentLeft, -Padding - 106, contentRight, -Padding - 80);

        _effectText = CreateText("Effect", root, font, EffectFontSize, FontStyle.Italic, TextAnchor.UpperLeft);
        _effectText.verticalOverflow = VerticalWrapMode.Overflow;
        SetAnchored(_effectText.rectTransform, contentLeft, Padding, contentRight, -Padding - 110);
    }

    private static Image CreateImage(string objectName, RectTransform parent)
    {
        GameObject child = new GameObject(objectName, typeof(RectTransform));
        RectTransform rectTransform = child.GetComponent<RectTransform>();
        rectTransform.SetParent(parent, false);
        Image image = child.AddComponent<Image>();
        image.raycastTarget = false;
        return image;
    }

    private static Image CreateOutlineImage(string objectName, RectTransform parent, Color outlineColor)
    {
        // Build the border with four explicit Image strips. The container
        // Image itself stays a faint fill so the slot reads as "present but
        // empty" even at a glance.
        GameObject child = new GameObject(objectName, typeof(RectTransform));
        RectTransform rectTransform = child.GetComponent<RectTransform>();
        rectTransform.SetParent(parent, false);

        Image fill = child.AddComponent<Image>();
        fill.color = new Color(outlineColor.r, outlineColor.g, outlineColor.b, 0.12f);
        fill.raycastTarget = false;

        const float thickness = 2f;
        AddBorderEdge(rectTransform, "Top", outlineColor, new Vector2(0f, 1f), new Vector2(1f, 1f), new Vector2(0f, -thickness), new Vector2(0f, 0f));
        AddBorderEdge(rectTransform, "Bottom", outlineColor, new Vector2(0f, 0f), new Vector2(1f, 0f), new Vector2(0f, 0f), new Vector2(0f, thickness));
        AddBorderEdge(rectTransform, "Left", outlineColor, new Vector2(0f, 0f), new Vector2(0f, 1f), new Vector2(0f, 0f), new Vector2(thickness, 0f));
        AddBorderEdge(rectTransform, "Right", outlineColor, new Vector2(1f, 0f), new Vector2(1f, 1f), new Vector2(-thickness, 0f), new Vector2(0f, 0f));

        return fill;
    }

    private static void AddBorderEdge(RectTransform parent, string edgeName, Color color, Vector2 anchorMin, Vector2 anchorMax, Vector2 offsetMin, Vector2 offsetMax)
    {
        GameObject edge = new GameObject(edgeName, typeof(RectTransform));
        RectTransform rect = edge.GetComponent<RectTransform>();
        rect.SetParent(parent, false);
        rect.anchorMin = anchorMin;
        rect.anchorMax = anchorMax;
        rect.offsetMin = offsetMin;
        rect.offsetMax = offsetMax;
        Image image = edge.AddComponent<Image>();
        image.color = color;
        image.raycastTarget = false;
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

    private static void SetAnchored(RectTransform rectTransform, float left, float bottom, float right, float top)
    {
        rectTransform.anchorMin = new Vector2(0f, 0f);
        rectTransform.anchorMax = new Vector2(1f, 1f);
        rectTransform.offsetMin = new Vector2(left, bottom);
        rectTransform.offsetMax = new Vector2(right, top);
    }
}
