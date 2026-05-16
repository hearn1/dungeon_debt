using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class CombatUnitCardView : MonoBehaviour
{
    private const int Padding = 8;
    private const int RoleBandWidth = 6;
    private const int TierBorderThickness = 2;
    private const int ActingOutlineThickness = 4;
    private const int NameFontSize = 14;
    private const int HpFontSize = 12;
    private const int VeteranFontSize = 9;
    private const int StatusFontSize = 11;
    private const float HitFlashDuration = 0.275f;

    // Portrait card: a fixed-height bottom footer band holds the name slot
    // (shown only as the no-sprite fallback, per M10.6) above the HP track,
    // with a slim role-accent top edge and a slightly darker background. The
    // portrait fills everything above the footer.
    private const int FooterHeight = 52;
    private const int FooterAccentThickness = 1;
    private const int FooterNameHeight = 18;
    private const int FooterHpTrackHeight = 20;
    private const int FooterHpBottomInset = 8;
    private const int FooterPortraitGap = 2;
    private const int VeteranTrackHeight = 12;
    private const int VeteranTrackGap = 4;
    private const int StatusIndicatorSize = 18;
    private const int StatusIndicatorGap = 3;
    private const int StatusIndicatorTopInset = 6;
    private const int StatusIndicatorRightInset = 6;
    private const int MaxStatusIndicators = 6;

    private static readonly Color HitFlashColor = new Color(1f, 0.32f, 0.28f, 1f);
    private static readonly Color ActingOutlineColor = new Color(1f, 0.92f, 0.42f, 1f);
    private static readonly Color FooterColor = new Color(0.10f, 0.11f, 0.13f, 1f);

    [SerializeField] private Image _background;
    [SerializeField] private Image _portrait;
    [SerializeField] private Image _roleBand;
    [SerializeField] private Image _footerBg;
    [SerializeField] private Image _footerAccent;
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
    [SerializeField] private Image _veteranTrack;
    [SerializeField] private Image _veteranFill;
    [SerializeField] private Text _veteranText;
    [SerializeField] private Image _hitFlashOverlay;

    private readonly List<Image> _statusBackgrounds = new List<Image>();
    private readonly List<Text> _statusTexts = new List<Text>();
    private CombatUnit _currentUnit;
    private float _hitFlashT = -1f;

    // Presentation-only: lets the combat view read this card's unit identity
    // when a replay event carries only a slot (e.g. enemy attackers have no
    // id on the event) to route the shared effect sprite by category. Read
    // only; no behavior or mutation.
    public CombatUnit CurrentUnit
    {
        get { return _currentUnit; }
    }

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
        if (_footerBg != null)
        {
            _footerBg.color = FooterColor;
            _footerBg.enabled = true;
        }
        if (_footerAccent != null)
        {
            _footerAccent.color = accent;
            _footerAccent.enabled = true;
        }
        _hpTrack.enabled = true;
        _hpFill.enabled = true;

        _nameText.text = unit.DisplayName;
        SetHpDisplay(unit.CurrentHealth, unit.MaxHealth);
        SetVeterancy(playerUnit, playerUnit ? unit.SourceHero.VeteranXp : 0);
        SetStatuses(unit.Statuses);

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

        if (_footerBg != null)
        {
            _footerBg.enabled = false;
        }

        if (_footerAccent != null)
        {
            _footerAccent.enabled = false;
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
            _nameText.enabled = false;
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

        SetVeterancy(false, 0);
        HideStatusIndicators();
        ResetHitFlash();
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

    public void SetStatusSnapshot(IReadOnlyList<CombatStatusId> statuses, int poisonDamage)
    {
        if (_currentUnit != null)
        {
            _currentUnit.Statuses.CopyFrom(null);
            if (statuses != null)
            {
                for (int i = 0; i < statuses.Count; i++)
                {
                    _currentUnit.Statuses.Add(statuses[i]);
                }
            }
            _currentUnit.Statuses.SetPoisonDamage(poisonDamage);
        }

        SetStatuses(statuses, poisonDamage);
    }

    // Static base art for this unit, resolved by stable id upstream. A null
    // sprite disables the portrait Image so the existing placeholder card box
    // (background tint, role band, borders) shows through unchanged.
    public void SetPortrait(Sprite sprite)
    {
        // The unit name is redundant clutter once a portrait identifies the
        // unit, so it is shown only as the fallback when no sprite resolves and
        // the bare placeholder box would otherwise be unidentifiable.
        bool hasSprite = sprite != null;
        if (_nameText != null)
        {
            _nameText.enabled = !hasSprite;
        }

        if (_portrait == null)
        {
            return;
        }

        if (!hasSprite)
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

    private void SetVeterancy(bool visible, int veteranXp)
    {
        if (_veteranTrack == null || _veteranFill == null || _veteranText == null)
        {
            return;
        }

        _veteranTrack.enabled = visible;
        _veteranFill.enabled = visible;
        _veteranText.enabled = visible;

        if (!visible)
        {
            _veteranText.text = string.Empty;
            _veteranFill.rectTransform.anchorMax = new Vector2(0f, 1f);
            return;
        }

        _veteranText.text = GameRules.GetVeteranProgressLabel(veteranXp);
        _veteranFill.rectTransform.anchorMax = new Vector2(GameRules.GetVeteranProgressRatio(veteranXp), 1f);
    }

    private void SetStatuses(CombatStatusState statusState)
    {
        if (statusState == null)
        {
            HideStatusIndicators();
            return;
        }

        SetStatuses(statusState.ActiveStatuses, statusState.PoisonDamage);
    }

    private void SetStatuses(IReadOnlyList<CombatStatusId> statuses, int poisonDamage)
    {
        HideStatusIndicators();
        if (statuses == null)
        {
            return;
        }

        int visibleCount = statuses.Count;
        if (visibleCount > MaxStatusIndicators)
        {
            visibleCount = MaxStatusIndicators;
        }

        for (int i = 0; i < visibleCount; i++)
        {
            CombatStatusId statusId = statuses[i];
            _statusBackgrounds[i].enabled = true;
            _statusBackgrounds[i].color = GameRules.GetCombatStatusColor(statusId);
            _statusTexts[i].enabled = true;
            _statusTexts[i].text = GameRules.GetCombatStatusLetter(statusId);
            _statusTexts[i].color = Color.white;

            if (statusId == CombatStatusId.Poisoned && poisonDamage > GameRules.PoisonInitialDamage)
            {
                _statusTexts[i].text = GameRules.GetCombatStatusLetter(statusId) + poisonDamage;
                _statusTexts[i].fontSize = StatusFontSize - 2;
            }
            else
            {
                _statusTexts[i].fontSize = StatusFontSize;
            }
        }
    }

    private void HideStatusIndicators()
    {
        for (int i = 0; i < _statusBackgrounds.Count; i++)
        {
            _statusBackgrounds[i].enabled = false;
        }

        for (int i = 0; i < _statusTexts.Count; i++)
        {
            _statusTexts[i].enabled = false;
            _statusTexts[i].text = string.Empty;
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
        SetEdgeTop(_tierBorderTop.rectTransform, TierBorderThickness);
        SetEdgeBottom(_tierBorderBottom.rectTransform, TierBorderThickness);
        SetEdgeLeft(_tierBorderLeft.rectTransform, TierBorderThickness);
        SetEdgeRight(_tierBorderRight.rectTransform, TierBorderThickness);

        // Created after the tier-frame images so the portrait is not occluded,
        // but before the footer/name/HP/flash overlays so they stay on top. The
        // portrait claims the full card above the footer band, minus the role
        // band gutter and the tier inset; preserveAspect keeps the art centred.
        _portrait = CreateImage("Portrait", root);
        SetAnchored(
            _portrait.rectTransform,
            RoleBandWidth + 2,
            FooterHeight + FooterPortraitGap,
            -3,
            -(StatusIndicatorTopInset + StatusIndicatorSize + 4));
        _portrait.preserveAspect = true;
        _portrait.enabled = false;

        // Footer band: darker background spanning the bottom of the card (right
        // of the role band) with a slim role-accent strip along its top edge.
        _footerBg = CreateImage("FooterBg", root);
        _footerBg.color = FooterColor;
        SetBottomAnchored(_footerBg.rectTransform, RoleBandWidth, 0, 0, FooterHeight);
        _footerBg.enabled = false;

        _footerAccent = CreateImage("FooterAccent", root);
        SetBottomAnchored(_footerAccent.rectTransform, RoleBandWidth, FooterHeight - FooterAccentThickness, 0, FooterAccentThickness);
        _footerAccent.enabled = false;

        _nameText = CreateText("Name", root, font, NameFontSize, FontStyle.Bold, TextAnchor.MiddleCenter);
        SetBottomAnchored(_nameText.rectTransform, RoleBandWidth + Padding, FooterHpBottomInset + FooterHpTrackHeight + 2, -Padding, FooterNameHeight);

        _hpTrack = CreateImage("HpTrack", root);
        _hpTrack.color = new Color(0.06f, 0.07f, 0.08f, 1f);
        SetBottomAnchored(_hpTrack.rectTransform, RoleBandWidth + Padding, FooterHpBottomInset, -Padding, FooterHpTrackHeight);

        _hpFill = CreateImage("HpFill", _hpTrack.rectTransform);
        _hpFill.rectTransform.anchorMin = new Vector2(0f, 0f);
        _hpFill.rectTransform.anchorMax = new Vector2(1f, 1f);
        _hpFill.rectTransform.offsetMin = Vector2.zero;
        _hpFill.rectTransform.offsetMax = Vector2.zero;

        _hpText = CreateText("HpText", _hpTrack.rectTransform, font, HpFontSize, FontStyle.Bold, TextAnchor.MiddleCenter);
        _hpText.color = new Color(0.96f, 0.97f, 0.94f, 1f);
        Stretch(_hpText.rectTransform, 1f);

        _veteranTrack = CreateImage("VeteranTrack", root);
        _veteranTrack.color = new Color(0.06f, 0.07f, 0.08f, 1f);
        SetBottomAnchored(
            _veteranTrack.rectTransform,
            RoleBandWidth + Padding,
            FooterHeight + VeteranTrackGap,
            -Padding,
            VeteranTrackHeight);

        _veteranFill = CreateImage("VeteranFill", _veteranTrack.rectTransform);
        _veteranFill.color = new Color(0.76f, 0.64f, 0.30f, 1f);
        _veteranFill.rectTransform.anchorMin = new Vector2(0f, 0f);
        _veteranFill.rectTransform.anchorMax = new Vector2(1f, 1f);
        _veteranFill.rectTransform.offsetMin = Vector2.zero;
        _veteranFill.rectTransform.offsetMax = Vector2.zero;

        _veteranText = CreateText("VeteranText", _veteranTrack.rectTransform, font, VeteranFontSize, FontStyle.Bold, TextAnchor.MiddleCenter);
        _veteranText.color = new Color(0.98f, 0.96f, 0.84f, 1f);
        Stretch(_veteranText.rectTransform, 1f);

        _hitFlashOverlay = CreateImage("HitFlashOverlay", root);
        StretchFill(_hitFlashOverlay.rectTransform);
        Color hitInit = HitFlashColor;
        hitInit.a = 0f;
        _hitFlashOverlay.color = hitInit;
        _hitFlashOverlay.enabled = false;

        for (int i = 0; i < MaxStatusIndicators; i++)
        {
            Image statusBg = CreateImage("StatusIndicator" + i, root);
            SetTopRightFixed(
                statusBg.rectTransform,
                StatusIndicatorRightInset + (i * (StatusIndicatorSize + StatusIndicatorGap)),
                StatusIndicatorTopInset,
                StatusIndicatorSize);
            statusBg.enabled = false;
            _statusBackgrounds.Add(statusBg);

            Text statusText = CreateText("StatusText" + i, statusBg.rectTransform, font, StatusFontSize, FontStyle.Bold, TextAnchor.MiddleCenter);
            statusText.horizontalOverflow = HorizontalWrapMode.Overflow;
            Stretch(statusText.rectTransform, 0f);
            statusText.enabled = false;
            _statusTexts.Add(statusText);
        }

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

    private static void SetTopRightFixed(RectTransform rectTransform, float right, float top, float size)
    {
        rectTransform.anchorMin = new Vector2(1f, 1f);
        rectTransform.anchorMax = new Vector2(1f, 1f);
        rectTransform.pivot = new Vector2(1f, 1f);
        rectTransform.anchoredPosition = new Vector2(-right, -top);
        rectTransform.sizeDelta = new Vector2(size, size);
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
