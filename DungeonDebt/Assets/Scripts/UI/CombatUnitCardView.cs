using UnityEngine;
using UnityEngine.UI;

public class CombatUnitCardView : MonoBehaviour
{
    private const int Padding = 8;
    private const int RoleBandWidth = 6;
    private const int TierBorderThickness = 2;
    private const int ActingOutlineThickness = 4;
    private const int HealFrameThickness = 5;
    private const int NameFontSize = 14;
    private const int HpFontSize = 12;
    private const float HitFlashDuration = 0.22f;
    private const float HealGlowDuration = 0.32f;

    private static readonly Color HitFlashColor = new Color(1f, 0.32f, 0.28f, 1f);
    private static readonly Color HealGlowColor = new Color(0.36f, 0.92f, 0.45f, 1f);
    private static readonly Color ActingOutlineColor = new Color(1f, 0.92f, 0.42f, 1f);

    [SerializeField] private Image _background;
    [SerializeField] private Image _portrait;
    [SerializeField] private Image _roleBand;
    [SerializeField] private Image _tierBorderTop;
    [SerializeField] private Image _tierBorderBottom;
    [SerializeField] private Image _tierBorderLeft;
    [SerializeField] private Image _tierBorderRight;
    [SerializeField] private Image _actingTop;
    [SerializeField] private Image _actingBottom;
    [SerializeField] private Image _actingLeft;
    [SerializeField] private Image _actingRight;
    [SerializeField] private Text _nameText;
    [SerializeField] private Text _hpText;
    [SerializeField] private Image _hpTrack;
    [SerializeField] private Image _hpFill;
    [SerializeField] private Image _hitFlashOverlay;
    [SerializeField] private Image _healTop;
    [SerializeField] private Image _healBottom;
    [SerializeField] private Image _healLeft;
    [SerializeField] private Image _healRight;

    private CombatUnit _currentUnit;
    private float _hitFlashT = -1f;
    private float _healGlowT = -1f;

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

        _currentUnit = unit;
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
        SetHpDisplay(unit.CurrentHealth, unit.MaxHealth);

        ApplyTierBorder(unit, playerUnit);
    }

    public void Clear()
    {
        _currentUnit = null;
        if (_background != null)
        {
            _background.color = new Color(0f, 0f, 0f, 0f);
        }

        if (_roleBand != null)
        {
            _roleBand.enabled = false;
        }

        if (_portrait != null)
        {
            _portrait.sprite = null;
            _portrait.enabled = false;
        }

        SetTierBorderEnabled(false);
        SetActing(false);

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

        ResetHitFlash();
        ResetHealGlow();
    }

    public void SetCurrentHealth(int currentHealth, int maxHealth)
    {
        if (_currentUnit != null)
        {
            _currentUnit.CurrentHealth = currentHealth;
            // Re-tint background if the unit just died, so the card doesn't
            // wait for a full Refresh to show the dead-state styling.
            if (currentHealth <= 0 && _background != null)
            {
                _background.color = new Color(0.22f, 0.08f, 0.08f, 1f);
            }
        }

        SetHpDisplay(currentHealth, maxHealth);
    }

    // Static base art for this unit, resolved by stable id upstream. A null
    // sprite disables the portrait Image so the existing placeholder card box
    // (background tint, role band, borders) shows through unchanged.
    public void SetPortrait(Sprite sprite)
    {
        if (_portrait == null)
        {
            return;
        }

        if (sprite == null)
        {
            _portrait.sprite = null;
            _portrait.enabled = false;
            return;
        }

        _portrait.sprite = sprite;
        _portrait.color = Color.white;
        _portrait.enabled = true;
    }

    public void SetActing(bool acting)
    {
        if (_actingTop != null) _actingTop.enabled = acting;
        if (_actingBottom != null) _actingBottom.enabled = acting;
        if (_actingLeft != null) _actingLeft.enabled = acting;
        if (_actingRight != null) _actingRight.enabled = acting;
    }

    public void FlashHit()
    {
        if (_hitFlashOverlay == null)
        {
            return;
        }
        _hitFlashOverlay.enabled = true;
        _hitFlashOverlay.color = HitFlashColor;
        _hitFlashT = 0f;
    }

    public void PlayHealGlow()
    {
        if (_healTop == null)
        {
            return;
        }
        SetHealFrameEnabled(true);
        SetHealFrameColor(HealGlowColor);
        _healGlowT = 0f;
    }

    private void Update()
    {
        if (_hitFlashT >= 0f)
        {
            _hitFlashT += Time.deltaTime;
            float t = _hitFlashT / HitFlashDuration;
            if (t >= 1f)
            {
                ResetHitFlash();
            }
            else if (_hitFlashOverlay != null)
            {
                Color c = HitFlashColor;
                c.a = 1f - t;
                _hitFlashOverlay.color = c;
            }
        }

        if (_healGlowT >= 0f)
        {
            _healGlowT += Time.deltaTime;
            float t = _healGlowT / HealGlowDuration;
            if (t >= 1f)
            {
                ResetHealGlow();
            }
            else if (_healTop != null)
            {
                Color c = HealGlowColor;
                // Quick rise then fade so the green frame pulses in.
                float alpha = t < 0.25f ? (t / 0.25f) : (1f - ((t - 0.25f) / 0.75f));
                c.a = alpha;
                SetHealFrameColor(c);
            }
        }
    }

    private void ResetHitFlash()
    {
        _hitFlashT = -1f;
        if (_hitFlashOverlay != null)
        {
            Color c = HitFlashColor;
            c.a = 0f;
            _hitFlashOverlay.color = c;
            _hitFlashOverlay.enabled = false;
        }
    }

    private void ResetHealGlow()
    {
        _healGlowT = -1f;
        if (_healTop != null)
        {
            Color c = HealGlowColor;
            c.a = 0f;
            SetHealFrameColor(c);
            SetHealFrameEnabled(false);
        }
    }

    private void SetHealFrameEnabled(bool enabled)
    {
        if (_healTop != null) _healTop.enabled = enabled;
        if (_healBottom != null) _healBottom.enabled = enabled;
        if (_healLeft != null) _healLeft.enabled = enabled;
        if (_healRight != null) _healRight.enabled = enabled;
    }

    private void SetHealFrameColor(Color color)
    {
        if (_healTop != null) _healTop.color = color;
        if (_healBottom != null) _healBottom.color = color;
        if (_healLeft != null) _healLeft.color = color;
        if (_healRight != null) _healRight.color = color;
    }

    private void SetHpDisplay(int currentHealth, int maxHealth)
    {
        int displayCurrent = currentHealth < 0 ? 0 : currentHealth;
        if (_hpText != null)
        {
            _hpText.text = "HP " + displayCurrent + "/" + maxHealth;
        }

        if (_hpFill == null)
        {
            return;
        }

        float ratio = 0f;
        if (maxHealth > 0)
        {
            ratio = (float)displayCurrent / maxHealth;
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

        // Created after the tier-frame images (which currently fill the card)
        // so the portrait is not occluded, but before the name/HP/flash
        // overlays so text stays on top. preserveAspect centres the square
        // art in a band clear of the bottom HP track.
        _portrait = CreateImage("Portrait", root);
        SetAnchored(_portrait.rectTransform, RoleBandWidth + Padding, Padding + 24 + 8, -Padding, -(Padding + 8));
        _portrait.preserveAspect = true;
        _portrait.enabled = false;

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

        _hitFlashOverlay = CreateImage("HitFlashOverlay", root);
        StretchFill(_hitFlashOverlay.rectTransform);
        Color hitInit = HitFlashColor;
        hitInit.a = 0f;
        _hitFlashOverlay.color = hitInit;
        _hitFlashOverlay.enabled = false;

        _healTop = CreateImage("HealFrameTop", root);
        _healBottom = CreateImage("HealFrameBottom", root);
        _healLeft = CreateImage("HealFrameLeft", root);
        _healRight = CreateImage("HealFrameRight", root);
        SetEdgeTop(_healTop.rectTransform, HealFrameThickness);
        SetEdgeBottom(_healBottom.rectTransform, HealFrameThickness);
        SetEdgeLeft(_healLeft.rectTransform, HealFrameThickness);
        SetEdgeRight(_healRight.rectTransform, HealFrameThickness);
        Color healInit = HealGlowColor;
        healInit.a = 0f;
        SetHealFrameColor(healInit);
        SetHealFrameEnabled(false);

        _actingTop = CreateImage("ActingOutlineTop", root);
        _actingBottom = CreateImage("ActingOutlineBottom", root);
        _actingLeft = CreateImage("ActingOutlineLeft", root);
        _actingRight = CreateImage("ActingOutlineRight", root);
        SetEdgeTop(_actingTop.rectTransform, ActingOutlineThickness);
        SetEdgeBottom(_actingBottom.rectTransform, ActingOutlineThickness);
        SetEdgeLeft(_actingLeft.rectTransform, ActingOutlineThickness);
        SetEdgeRight(_actingRight.rectTransform, ActingOutlineThickness);
        _actingTop.color = ActingOutlineColor;
        _actingBottom.color = ActingOutlineColor;
        _actingLeft.color = ActingOutlineColor;
        _actingRight.color = ActingOutlineColor;
        _actingTop.enabled = false;
        _actingBottom.enabled = false;
        _actingLeft.enabled = false;
        _actingRight.enabled = false;
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

    private static void StretchFill(RectTransform rectTransform)
    {
        rectTransform.anchorMin = Vector2.zero;
        rectTransform.anchorMax = Vector2.one;
        rectTransform.offsetMin = Vector2.zero;
        rectTransform.offsetMax = Vector2.zero;
    }

    // Thin strip hugging one card edge (full length along that edge). Unlike
    // SetAnchored, these keep a fixed pixel thickness and do not stretch to
    // fill the card, so the result reads as an outline rather than a fill.
    private static void SetEdgeTop(RectTransform rt, float thickness)
    {
        rt.anchorMin = new Vector2(0f, 1f);
        rt.anchorMax = new Vector2(1f, 1f);
        rt.pivot = new Vector2(0.5f, 1f);
        rt.anchoredPosition = Vector2.zero;
        rt.sizeDelta = new Vector2(0f, thickness);
    }

    private static void SetEdgeBottom(RectTransform rt, float thickness)
    {
        rt.anchorMin = new Vector2(0f, 0f);
        rt.anchorMax = new Vector2(1f, 0f);
        rt.pivot = new Vector2(0.5f, 0f);
        rt.anchoredPosition = Vector2.zero;
        rt.sizeDelta = new Vector2(0f, thickness);
    }

    private static void SetEdgeLeft(RectTransform rt, float thickness)
    {
        rt.anchorMin = new Vector2(0f, 0f);
        rt.anchorMax = new Vector2(0f, 1f);
        rt.pivot = new Vector2(0f, 0.5f);
        rt.anchoredPosition = Vector2.zero;
        rt.sizeDelta = new Vector2(thickness, 0f);
    }

    private static void SetEdgeRight(RectTransform rt, float thickness)
    {
        rt.anchorMin = new Vector2(1f, 0f);
        rt.anchorMax = new Vector2(1f, 1f);
        rt.pivot = new Vector2(1f, 0.5f);
        rt.anchoredPosition = Vector2.zero;
        rt.sizeDelta = new Vector2(thickness, 0f);
    }
}
