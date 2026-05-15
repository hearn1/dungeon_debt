using UnityEngine;
using UnityEngine.UI;

public class CombatUnitCardView : MonoBehaviour
{
    private const int Padding = 8;
    private const int RoleBandWidth = 6;
    private const int TierBorderThickness = 2;
    private const int NameFontSize = 14;
    private const int HpFontSize = 12;

    [SerializeField] private Image _background;
    [SerializeField] private Image _roleBand;
    [SerializeField] private Image _tierBorderTop;
    [SerializeField] private Image _tierBorderBottom;
    [SerializeField] private Image _tierBorderLeft;
    [SerializeField] private Image _tierBorderRight;
    [SerializeField] private Text _nameText;
    [SerializeField] private Text _hpText;
    [SerializeField] private Image _hpTrack;
    [SerializeField] private Image _hpFill;

    public void Initialize(Font font)
    {
        BuildUi(font);
        Clear();
    }

    public void Refresh(CombatUnit unit)
    {
        if (unit == null)
        {
            Clear();
            return;
        }

        bool playerUnit = unit.IsPlayerSide && unit.SourceHero != null && unit.SourceHero.Definition != null;
        Color accent = playerUnit
            ? GameRules.GetRoleColor(unit.SourceHero.Definition.Role)
            : new Color(0.64f, 0.31f, 0.29f, 1f);

        _background.color = unit.IsAlive
            ? new Color(0.16f, 0.17f, 0.2f, 1f)
            : new Color(0.22f, 0.08f, 0.08f, 1f);
        _roleBand.color = accent;
        _roleBand.enabled = true;
        _hpTrack.enabled = true;
        _hpFill.enabled = true;

        _nameText.text = unit.DisplayName;
        _hpText.text = "HP " + unit.CurrentHealth + "/" + unit.MaxHealth;

        ApplyTierBorder(unit, playerUnit);
        ApplyHpFill(unit);
    }

    public void Clear()
    {
        if (_background != null)
        {
            _background.color = new Color(0f, 0f, 0f, 0f);
        }

        if (_roleBand != null)
        {
            _roleBand.enabled = false;
        }

        SetTierBorderEnabled(false);

        if (_nameText != null)
        {
            _nameText.text = string.Empty;
        }

        if (_hpText != null)
        {
            _hpText.text = string.Empty;
        }

        if (_hpFill != null)
        {
            _hpFill.enabled = false;
            _hpFill.rectTransform.anchorMax = new Vector2(0f, 1f);
        }

        if (_hpTrack != null)
        {
            _hpTrack.enabled = false;
        }
    }

    private void ApplyTierBorder(CombatUnit unit, bool playerUnit)
    {
        if (!playerUnit)
        {
            SetTierBorderEnabled(false);
            return;
        }

        HeroTier tier = unit.SourceHero.Tier;
        Color tierColor = tier == HeroTier.Silver
            ? GameRules.SilverBadgeColor
            : GameRules.BronzeBadgeColor;
        SetTierBorderEnabled(true);
        _tierBorderTop.color = tierColor;
        _tierBorderBottom.color = tierColor;
        _tierBorderLeft.color = tierColor;
        _tierBorderRight.color = tierColor;
    }

    private void SetTierBorderEnabled(bool enabled)
    {
        if (_tierBorderTop != null)
        {
            _tierBorderTop.enabled = enabled;
        }
        if (_tierBorderBottom != null)
        {
            _tierBorderBottom.enabled = enabled;
        }
        if (_tierBorderLeft != null)
        {
            _tierBorderLeft.enabled = enabled;
        }
        if (_tierBorderRight != null)
        {
            _tierBorderRight.enabled = enabled;
        }
    }

    private void ApplyHpFill(CombatUnit unit)
    {
        float ratio = 0f;
        if (unit.MaxHealth > 0)
        {
            ratio = (float)unit.CurrentHealth / unit.MaxHealth;
        }

        if (ratio < 0f)
        {
            ratio = 0f;
        }
        else if (ratio > 1f)
        {
            ratio = 1f;
        }

        _hpFill.color = ratio > 0.5f
            ? new Color(0.33f, 0.72f, 0.42f, 1f)
            : new Color(0.82f, 0.42f, 0.32f, 1f);
        _hpFill.rectTransform.anchorMax = new Vector2(ratio, 1f);
    }

    private void BuildUi(Font font)
    {
        RectTransform root = GetComponent<RectTransform>();
        if (root == null)
        {
            root = gameObject.AddComponent<RectTransform>();
        }

        _background = gameObject.GetComponent<Image>();
        if (_background == null)
        {
            _background = gameObject.AddComponent<Image>();
        }
        _background.raycastTarget = false;

        _roleBand = CreateImage("RoleBand", root);
        RectTransform bandRect = _roleBand.rectTransform;
        bandRect.anchorMin = new Vector2(0f, 0f);
        bandRect.anchorMax = new Vector2(0f, 1f);
        bandRect.pivot = new Vector2(0f, 0.5f);
        bandRect.offsetMin = Vector2.zero;
        bandRect.offsetMax = new Vector2(RoleBandWidth, 0f);

        _tierBorderTop = CreateImage("TierBorderTop", root);
        _tierBorderBottom = CreateImage("TierBorderBottom", root);
        _tierBorderLeft = CreateImage("TierBorderLeft", root);
        _tierBorderRight = CreateImage("TierBorderRight", root);
        SetTopAnchored(_tierBorderTop.rectTransform, 0f, 0f, 0f, TierBorderThickness);
        SetBottomAnchored(_tierBorderBottom.rectTransform, 0f, 0f, 0f, TierBorderThickness);
        SetAnchored(_tierBorderLeft.rectTransform, 0f, 0f, TierBorderThickness, 0f);
        SetAnchored(_tierBorderRight.rectTransform, -TierBorderThickness, 0f, 0f, 0f);

        _nameText = CreateText("Name", root, font, NameFontSize, FontStyle.Bold, TextAnchor.UpperLeft);
        SetTopAnchored(_nameText.rectTransform, RoleBandWidth + Padding, Padding + 8, -Padding, 46);

        _hpTrack = CreateImage("HpTrack", root);
        _hpTrack.color = new Color(0.06f, 0.07f, 0.08f, 1f);
        SetBottomAnchored(_hpTrack.rectTransform, RoleBandWidth + Padding, Padding + 8, -Padding, 24);

        _hpFill = CreateImage("HpFill", _hpTrack.rectTransform);
        _hpFill.rectTransform.anchorMin = new Vector2(0f, 0f);
        _hpFill.rectTransform.anchorMax = new Vector2(1f, 1f);
        _hpFill.rectTransform.offsetMin = Vector2.zero;
        _hpFill.rectTransform.offsetMax = Vector2.zero;

        _hpText = CreateText("HpText", _hpTrack.rectTransform, font, HpFontSize, FontStyle.Bold, TextAnchor.MiddleCenter);
        _hpText.color = new Color(0.96f, 0.97f, 0.94f, 1f);
        Stretch(_hpText.rectTransform, 1f);
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

    private static void SetBottomAnchored(RectTransform rectTransform, float left, float bottom, float right, float height)
    {
        rectTransform.anchorMin = new Vector2(0f, 0f);
        rectTransform.anchorMax = new Vector2(1f, 0f);
        rectTransform.offsetMin = new Vector2(left, bottom);
        rectTransform.offsetMax = new Vector2(right, bottom + height);
    }

    private static void SetTopAnchored(RectTransform rectTransform, float left, float top, float right, float height)
    {
        rectTransform.anchorMin = new Vector2(0f, 1f);
        rectTransform.anchorMax = new Vector2(1f, 1f);
        rectTransform.offsetMin = new Vector2(left, -top - height);
        rectTransform.offsetMax = new Vector2(right, -top);
    }

    private static void Stretch(RectTransform rectTransform, float inset)
    {
        rectTransform.anchorMin = Vector2.zero;
        rectTransform.anchorMax = Vector2.one;
        rectTransform.offsetMin = new Vector2(inset, inset);
        rectTransform.offsetMax = new Vector2(-inset, -inset);
    }
}
