using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class CombatPanelView : MonoBehaviour
{
    private const int Padding = 18;
    private const int TitleHeight = 30;
    private const int RowLabelWidth = 104;
    // M10.7: enlarged for the v2 footer-card layout. The combat-only screen
    // reclaim in MainMenuPanel frees ~316px of top chrome (combat panel grows
    // 510 -> 826px) while the scrolling log stays put. Largest 4-row fit there
    // is ~176 tall (ideal was 208; capped here to preserve the unchanged
    // scrolling log and the bounded top reclaim): bottom of row 4 =
    // 56 + 4*176 + 5*8 = 800 <= 826 panel height.
    private const int CardWidth = 200;
    private const int CardHeight = 176;
    private const int CardGap = 22;
    private const int RowGap = 8;
    private const int FrontlineSlots = GameRules.FrontlineSlots;
    private const int BacklineSlots = GameRules.BacklineSlots;
    private const int EffectSpriteSize = 80;
    private const float EffectLungeDuration = 0.125f;
    private const float EffectHoldDuration = 0.0375f;
    private const float EffectRetractDuration = 0.0875f;

    // Shared 5-sprite effect-category ids (match SpriteCatalog effect ids and
    // IMPLEMENTATION_PLAN.md §15). No per-unit unique art: every unit routes
    // to one of these.
    private const string EffectMeleeStab = "melee_stab";
    private const string EffectArrow = "arrow";
    private const string EffectFireball = "fireball";
    private const string EffectHeal = "heal";
    private const string EffectEnchant = "enchant";

    [SerializeField] private Text _titleText;
    [SerializeField] private Text _enemyBackLabel;
    [SerializeField] private Text _enemyFrontLabel;
    [SerializeField] private Text _playerFrontLabel;
    [SerializeField] private Text _playerBackLabel;
    [SerializeField] private RectTransform _enemyBackRow;
    [SerializeField] private RectTransform _enemyFrontRow;
    [SerializeField] private RectTransform _playerFrontRow;
    [SerializeField] private RectTransform _playerBackRow;

    private readonly List<CombatUnitCardView> _enemyBackCards = new List<CombatUnitCardView>();
    private readonly List<CombatUnitCardView> _enemyFrontCards = new List<CombatUnitCardView>();
    private readonly List<CombatUnitCardView> _playerFrontCards = new List<CombatUnitCardView>();
    private readonly List<CombatUnitCardView> _playerBackCards = new List<CombatUnitCardView>();
    private readonly List<CombatUnit> _scratchEnemyBack = new List<CombatUnit>();
    private readonly List<CombatUnit> _scratchEnemyFront = new List<CombatUnit>();
    private readonly List<CombatUnit> _scratchPlayerFront = new List<CombatUnit>();
    private readonly List<CombatUnit> _scratchPlayerBack = new List<CombatUnit>();
    private Font _font;
    private SpriteCatalog _spriteCatalog;

    private enum EffectPhase { Idle, Lunge, Hold, Retract }
    private Image _effectSprite;
    private RectTransform _effectSpriteRect;
    private EffectPhase _effectPhase = EffectPhase.Idle;
    private float _effectT;
    private Vector3 _effectFromLocal;
    private Vector3 _effectToLocal;

    public void Initialize(Font font, SpriteCatalog spriteCatalog)
    {
        _font = font;
        _spriteCatalog = spriteCatalog;
        BuildUi(font);
        Clear();
    }

    public void Refresh(IReadOnlyList<CombatUnit> playerUnits, IReadOnlyList<CombatUnit> enemyUnits)
    {
        gameObject.SetActive(true);
        _titleText.text = "Combat";
        _enemyBackLabel.text = "Enemy Back";
        _enemyFrontLabel.text = "Enemy Front";
        _playerFrontLabel.text = "Hero Front";
        _playerBackLabel.text = "Hero Back";

        SplitUnits(enemyUnits, _scratchEnemyFront, _scratchEnemyBack);
        SplitUnits(playerUnits, _scratchPlayerFront, _scratchPlayerBack);

        RefreshFixedRow(_enemyBackCards, _enemyBackRow, _scratchEnemyBack, GameRules.FrontlineSlots, BacklineSlots);
        RefreshFixedRow(_enemyFrontCards, _enemyFrontRow, _scratchEnemyFront, 0, FrontlineSlots);
        RefreshFixedRow(_playerFrontCards, _playerFrontRow, _scratchPlayerFront, 0, FrontlineSlots);
        RefreshFixedRow(_playerBackCards, _playerBackRow, _scratchPlayerBack, GameRules.FrontlineSlots, BacklineSlots);

        PlayCombatStartEnchant(playerUnits);
    }

    public void Clear()
    {
        _titleText.text = string.Empty;
        _enemyBackLabel.text = string.Empty;
        _enemyFrontLabel.text = string.Empty;
        _playerFrontLabel.text = string.Empty;
        _playerBackLabel.text = string.Empty;
        ClearCards(_enemyBackCards);
        ClearCards(_enemyFrontCards);
        ClearCards(_playerFrontCards);
        ClearCards(_playerBackCards);
        ResetEffect();
    }

    public void Hide()
    {
        gameObject.SetActive(false);
    }

    public void Show()
    {
        gameObject.SetActive(true);
    }

    public void ApplyReplayEvent(CombatReplayEvent evt)
    {
        if (evt == null)
        {
            return;
        }

        ClearAllActing();

        if (evt.Kind == CombatReplayEventKind.Attack)
        {
            CombatUnitCardView attackerCard = FindCard(evt.AttackerIsPlayerSide, evt.AttackerSlot);
            CombatUnitCardView targetCard = FindCard(evt.TargetIsPlayerSide, evt.TargetSlot);
            if (attackerCard != null)
            {
                attackerCard.SetActing(true);
                attackerCard.SetStatusSnapshot(evt.AttackerStatuses, evt.AttackerPoisonDamage);
            }
            if (targetCard != null)
            {
                bool played = false;
                if (attackerCard != null)
                {
                    string effectId = ResolveAttackEffectId(evt, attackerCard);
                    Sprite sprite = GetEffectSprite(effectId);
                    // Damage effects (stab/arrow/fireball) aim toward the target.
                    played = PlayEffect(attackerCard, targetCard, sprite, true);
                }
                if (!played)
                {
                    targetCard.FlashHit();
                }
                targetCard.SetCurrentHealth(evt.TargetHealthAfter, evt.TargetMaxHealth);
                targetCard.SetStatusSnapshot(evt.TargetStatuses, evt.TargetPoisonDamage);
            }
            return;
        }

        if (evt.Kind == CombatReplayEventKind.Heal)
        {
            CombatUnitCardView healerCard = FindCard(evt.AttackerIsPlayerSide, evt.AttackerSlot);
            CombatUnitCardView targetCard = FindCard(evt.TargetIsPlayerSide, evt.TargetSlot);
            if (healerCard != null)
            {
                healerCard.SetActing(true);
                healerCard.SetStatusSnapshot(evt.AttackerStatuses, evt.AttackerPoisonDamage);
            }
            if (targetCard != null)
            {
                // Heal shows the shared upright heal sprite pulsed on the
                // target (no travel, no rotation), matching the enchant
                // treatment, instead of the prior green glow frame.
                PlayEffect(targetCard, targetCard, GetEffectSprite(EffectHeal), false);
                targetCard.SetCurrentHealth(evt.TargetHealthAfter, evt.TargetMaxHealth);
                targetCard.SetStatusSnapshot(evt.TargetStatuses, evt.TargetPoisonDamage);
            }
            return;
        }

        if (evt.Kind == CombatReplayEventKind.Death)
        {
            CombatUnitCardView targetCard = FindCard(evt.TargetIsPlayerSide, evt.TargetSlot);
            if (targetCard != null)
            {
                targetCard.SetCurrentHealth(0, evt.TargetMaxHealth);
                targetCard.SetStatusSnapshot(evt.TargetStatuses, evt.TargetPoisonDamage);
            }
            return;
        }

        if (evt.Kind == CombatReplayEventKind.StatusChange || evt.Kind == CombatReplayEventKind.StatusDamage)
        {
            CombatUnitCardView targetCard = FindCard(evt.TargetIsPlayerSide, evt.TargetSlot);
            if (targetCard != null)
            {
                targetCard.SetCurrentHealth(evt.TargetHealthAfter, evt.TargetMaxHealth);
                targetCard.SetStatusSnapshot(evt.TargetStatuses, evt.TargetPoisonDamage);
                if (evt.Kind == CombatReplayEventKind.StatusDamage)
                {
                    targetCard.FlashHit();
                }
            }
            return;
        }

        // Message: no card-level visual side effect.
    }

    public void ClearAllActing()
    {
        ClearActingInRow(_enemyBackCards);
        ClearActingInRow(_enemyFrontCards);
        ClearActingInRow(_playerFrontCards);
        ClearActingInRow(_playerBackCards);
    }

    // Board-level traveling effect: a single shared effect sprite lunges from
    // the source card to the target card and retracts, synced to the replay
    // step. When source == target (combat-start enchant) it pulses in place.
    // Returns false (so an attack caller can fall back to a hit flash) if the
    // sprite/cards are unavailable.
    private bool PlayEffect(CombatUnitCardView fromCard, CombatUnitCardView toCard, Sprite sprite, bool aimAtTarget)
    {
        if (_effectSprite == null || sprite == null || fromCard == null || toCard == null)
        {
            return false;
        }

        RectTransform parentRect = _effectSpriteRect.parent as RectTransform;
        if (parentRect == null)
        {
            return false;
        }

        Vector3 fromWorld = ((RectTransform)fromCard.transform).position;
        Vector3 toWorld = ((RectTransform)toCard.transform).position;
        _effectFromLocal = parentRect.InverseTransformPoint(fromWorld);
        _effectToLocal = parentRect.InverseTransformPoint(toWorld);
        _effectFromLocal.z = 0f;
        _effectToLocal.z = 0f;

        if (aimAtTarget)
        {
            Vector3 dir = _effectToLocal - _effectFromLocal;
            // Sprite is authored pointing up (+Y); rotate so the tip leads
            // toward the target. No spinning — one fixed aim for the thrust.
            float angle = Mathf.Atan2(dir.y, dir.x) * Mathf.Rad2Deg - 90f;
            _effectSpriteRect.localRotation = Quaternion.Euler(0f, 0f, angle);
        }
        else
        {
            // Heal/enchant stay upright (no directional aim).
            _effectSpriteRect.localRotation = Quaternion.identity;
        }

        _effectSprite.sprite = sprite;
        _effectSprite.enabled = true;
        _effectSprite.color = Color.white;
        _effectSpriteRect.localPosition = _effectFromLocal;

        _effectPhase = EffectPhase.Lunge;
        _effectT = 0f;
        return true;
    }

    private void Update()
    {
        if (_effectPhase == EffectPhase.Idle)
        {
            return;
        }

        _effectT += Time.deltaTime;

        if (_effectPhase == EffectPhase.Lunge)
        {
            float p = _effectT / EffectLungeDuration;
            if (p >= 1f)
            {
                _effectSpriteRect.localPosition = _effectToLocal;
                _effectPhase = EffectPhase.Hold;
                _effectT = 0f;
                return;
            }
            // Ease-out so the thrust snaps forward.
            float eased = 1f - ((1f - p) * (1f - p));
            _effectSpriteRect.localPosition = Vector3.Lerp(_effectFromLocal, _effectToLocal, eased);
            return;
        }

        if (_effectPhase == EffectPhase.Hold)
        {
            if (_effectT >= EffectHoldDuration)
            {
                _effectPhase = EffectPhase.Retract;
                _effectT = 0f;
            }
            return;
        }

        // Retract.
        float r = _effectT / EffectRetractDuration;
        if (r >= 1f)
        {
            ResetEffect();
            return;
        }
        _effectSpriteRect.localPosition = Vector3.Lerp(_effectToLocal, _effectFromLocal, r);
    }

    private void ResetEffect()
    {
        _effectPhase = EffectPhase.Idle;
        _effectT = 0f;
        if (_effectSprite != null)
        {
            _effectSprite.enabled = false;
        }
    }

    private Sprite GetEffectSprite(string effectId)
    {
        if (_spriteCatalog == null || string.IsNullOrEmpty(effectId))
        {
            return null;
        }
        return _spriteCatalog.GetEffectSprite(effectId);
    }

    // Routes an attack replay event to one of the 5 shared effect ids.
    // Player heroes carry an id on the event; enemies do not, so the
    // attacker card's CurrentUnit supplies the enemy identity. Structured so
    // a future per-enemy mapping (post-M10, if scope is re-ratified) only
    // needs to extend ResolveEnemyAttackEffectId — it still must resolve to
    // one of the shared ids unless the 5-sprite cap is lifted.
    private static string ResolveAttackEffectId(CombatReplayEvent evt, CombatUnitCardView attackerCard)
    {
        if (evt != null && evt.AttackerIsPlayerSide && !string.IsNullOrEmpty(evt.AttackerHeroId))
        {
            return ResolveHeroAttackEffectId(evt.AttackerHeroId);
        }

        CombatUnit attacker = attackerCard != null ? attackerCard.CurrentUnit : null;
        if (attacker != null && attacker.SourceEnemy != null)
        {
            return ResolveEnemyAttackEffectId(attacker.SourceEnemy.Id);
        }

        return EffectMeleeStab;
    }

    private static string ResolveHeroAttackEffectId(string heroId)
    {
        // §15 mapping: only Ranger/Wizard differ from the melee default.
        if (heroId == "ranger")
        {
            return EffectArrow;
        }
        if (heroId == "wizard")
        {
            return EffectFireball;
        }
        return EffectMeleeStab;
    }

    private static string ResolveEnemyAttackEffectId(string enemyId)
    {
        // §15 mapping: only Frugal Archer differs from the melee default.
        // Extension point for future per-enemy routing (still capped to the
        // shared ids unless the scope docs are updated).
        if (enemyId == "frugal_archer")
        {
            return EffectArrow;
        }
        return EffectMeleeStab;
    }

    // Combat-start flourish: if an Enchanter is on the player board, pulse the
    // upright shared enchant sprite on its own card. Derived from the start
    // snapshot only (no replay/combat state) — mirrors how ResolveBaseSprite
    // reads unit identity for portraits.
    private void PlayCombatStartEnchant(IReadOnlyList<CombatUnit> playerUnits)
    {
        if (playerUnits == null)
        {
            return;
        }

        for (int i = 0; i < playerUnits.Count; i++)
        {
            CombatUnit unit = playerUnits[i];
            if (unit == null || unit.SourceHero == null || unit.SourceHero.Definition == null)
            {
                continue;
            }
            if (unit.SourceHero.Definition.Id != "enchanter")
            {
                continue;
            }

            CombatUnitCardView card = FindCard(true, unit.Slot);
            if (card != null)
            {
                PlayEffect(card, card, GetEffectSprite(EffectEnchant), false);
            }
            return;
        }
    }

    private CombatUnitCardView FindCard(bool isPlayerSide, int slot)
    {
        if (isPlayerSide)
        {
            if (slot < GameRules.FrontlineSlots)
            {
                return GetCardAtIndex(_playerFrontCards, slot);
            }
            return GetCardAtIndex(_playerBackCards, slot - GameRules.FrontlineSlots);
        }

        if (slot < GameRules.FrontlineSlots)
        {
            return GetCardAtIndex(_enemyFrontCards, slot);
        }
        return GetCardAtIndex(_enemyBackCards, slot - GameRules.FrontlineSlots);
    }

    private static CombatUnitCardView GetCardAtIndex(List<CombatUnitCardView> cards, int index)
    {
        if (cards == null || index < 0 || index >= cards.Count)
        {
            return null;
        }
        return cards[index];
    }

    private static void ClearActingInRow(List<CombatUnitCardView> cards)
    {
        if (cards == null)
        {
            return;
        }
        for (int i = 0; i < cards.Count; i++)
        {
            cards[i].SetActing(false);
        }
    }

    private void RefreshFixedRow(
        List<CombatUnitCardView> cards,
        RectTransform row,
        IReadOnlyList<CombatUnit> units,
        int firstSlot,
        int slotCount)
    {
        EnsureCardCount(cards, row, slotCount);

        for (int i = 0; i < cards.Count; i++)
        {
            cards[i].gameObject.SetActive(true);
            CombatUnit unit = FindUnitInSlot(units, firstSlot + i);
            if (unit != null)
            {
                cards[i].Refresh(unit);
                cards[i].SetPortrait(ResolveBaseSprite(unit));
            }
            else
            {
                cards[i].Clear();
            }
        }
    }

    // Presentation-only lookup: hero cards key on the hero definition id,
    // enemy cards on the enemy definition id. A null catalog or a missing
    // sprite returns null, which the card renders as the placeholder box.
    private Sprite ResolveBaseSprite(CombatUnit unit)
    {
        if (_spriteCatalog == null || unit == null)
        {
            return null;
        }

        if (unit.IsPlayerSide)
        {
            if (unit.SourceHero != null && unit.SourceHero.Definition != null)
            {
                return _spriteCatalog.GetHeroSprite(unit.SourceHero.Definition.Id);
            }
            return null;
        }

        if (unit.SourceEnemy != null)
        {
            return _spriteCatalog.GetEnemySprite(unit.SourceEnemy.Id);
        }
        return null;
    }

    private static CombatUnit FindUnitInSlot(IReadOnlyList<CombatUnit> units, int slot)
    {
        if (units == null)
        {
            return null;
        }

        for (int i = 0; i < units.Count; i++)
        {
            CombatUnit unit = units[i];
            if (unit.Slot == slot)
            {
                return unit;
            }
        }

        return null;
    }

    private static void SplitUnits(IReadOnlyList<CombatUnit> source, List<CombatUnit> front, List<CombatUnit> back)
    {
        front.Clear();
        back.Clear();
        if (source == null)
        {
            return;
        }

        for (int i = 0; i < source.Count; i++)
        {
            CombatUnit unit = source[i];
            if (unit.Slot < GameRules.FrontlineSlots)
            {
                front.Add(unit);
            }
            else
            {
                back.Add(unit);
            }
        }
    }

    private void EnsureCardCount(List<CombatUnitCardView> cards, RectTransform row, int count)
    {
        while (cards.Count < count)
        {
            RectTransform cardRect = CreateRect("CombatUnitCard", row);
            LayoutElement layoutElement = cardRect.gameObject.AddComponent<LayoutElement>();
            ApplyCardSize(cardRect, layoutElement);
            CombatUnitCardView card = cardRect.gameObject.AddComponent<CombatUnitCardView>();
            card.Initialize(_font);
            cards.Add(card);
        }

        for (int i = 0; i < cards.Count; i++)
        {
            RectTransform cardRect = (RectTransform)cards[i].transform;
            LayoutElement layoutElement = cardRect.GetComponent<LayoutElement>();
            ApplyCardSize(cardRect, layoutElement);
        }
    }

    private static void ApplyCardSize(RectTransform cardRect, LayoutElement layoutElement)
    {
        // The row layout leaves childControlWidth/Height disabled so cards keep
        // their explicit RectTransform size. Preferred size alone is ignored in
        // that mode and Unity falls back to the default 100x100 rect.
        cardRect.sizeDelta = new Vector2(CardWidth, CardHeight);
        if (layoutElement != null)
        {
            layoutElement.preferredWidth = CardWidth;
            layoutElement.preferredHeight = CardHeight;
        }
    }

    private static void ClearCards(List<CombatUnitCardView> cards)
    {
        for (int i = 0; i < cards.Count; i++)
        {
            cards[i].Clear();
            cards[i].gameObject.SetActive(false);
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
        background.color = new Color(0.12f, 0.13f, 0.16f, 1f);
        background.raycastTarget = false;

        _titleText = CreateText("Title", root, font, 22, FontStyle.Bold, TextAnchor.MiddleLeft);
        SetTopAnchored(_titleText.rectTransform, Padding, Padding, -Padding, TitleHeight);

        int firstRowTop = Padding + TitleHeight + 8;
        int secondRowTop = firstRowTop + CardHeight + RowGap;
        int thirdRowTop = secondRowTop + CardHeight + (RowGap * 3);
        int fourthRowTop = thirdRowTop + CardHeight + RowGap;

        _enemyBackLabel = CreateRowLabel("EnemyBackLabel", root, font, firstRowTop);
        _enemyFrontLabel = CreateRowLabel("EnemyFrontLabel", root, font, secondRowTop);
        _playerFrontLabel = CreateRowLabel("PlayerFrontLabel", root, font, thirdRowTop);
        _playerBackLabel = CreateRowLabel("PlayerBackLabel", root, font, fourthRowTop);

        float backRowWidth = (CardWidth * BacklineSlots) + (CardGap * (BacklineSlots - 1));
        float frontRowWidth = (CardWidth * FrontlineSlots) + (CardGap * (FrontlineSlots - 1));

        _enemyBackRow = CreateRow("EnemyBackRow", root);
        SetTopCentered(_enemyBackRow, backRowWidth, firstRowTop, CardHeight);

        _enemyFrontRow = CreateRow("EnemyFrontRow", root);
        SetTopCentered(_enemyFrontRow, frontRowWidth, secondRowTop, CardHeight);

        _playerFrontRow = CreateRow("PlayerFrontRow", root);
        SetTopCentered(_playerFrontRow, frontRowWidth, thirdRowTop, CardHeight);

        _playerBackRow = CreateRow("PlayerBackRow", root);
        SetTopCentered(_playerBackRow, backRowWidth, fourthRowTop, CardHeight);

        // Created last so it is the topmost child of the combat panel and
        // renders above every card row during the traveling-effect animation.
        RectTransform effectRect = CreateRect("EffectSprite", root);
        effectRect.anchorMin = new Vector2(0.5f, 0.5f);
        effectRect.anchorMax = new Vector2(0.5f, 0.5f);
        effectRect.pivot = new Vector2(0.5f, 0.5f);
        effectRect.sizeDelta = new Vector2(EffectSpriteSize, EffectSpriteSize);
        effectRect.localPosition = Vector3.zero;
        _effectSprite = effectRect.gameObject.AddComponent<Image>();
        _effectSprite.raycastTarget = false;
        _effectSprite.preserveAspect = true;
        _effectSprite.enabled = false;
        _effectSpriteRect = effectRect;
    }

    private static Text CreateRowLabel(string objectName, RectTransform parent, Font font, int top)
    {
        Text label = CreateText(objectName, parent, font, 14, FontStyle.Bold, TextAnchor.MiddleLeft);
        SetTopAnchored(label.rectTransform, Padding, top, Padding + RowLabelWidth, CardHeight);
        return label;
    }

    private static RectTransform CreateRow(string objectName, RectTransform parent)
    {
        RectTransform row = CreateRect(objectName, parent);
        HorizontalLayoutGroup layout = row.gameObject.AddComponent<HorizontalLayoutGroup>();
        layout.spacing = CardGap;
        layout.childAlignment = TextAnchor.MiddleLeft;
        layout.childControlWidth = false;
        layout.childControlHeight = false;
        layout.childForceExpandWidth = false;
        layout.childForceExpandHeight = false;
        return row;
    }

    private static RectTransform CreateRect(string objectName, RectTransform parent)
    {
        GameObject child = new GameObject(objectName, typeof(RectTransform));
        RectTransform rectTransform = child.GetComponent<RectTransform>();
        rectTransform.SetParent(parent, false);
        return rectTransform;
    }

    private static Text CreateText(string objectName, RectTransform parent, Font font, int fontSize, FontStyle fontStyle, TextAnchor alignment)
    {
        RectTransform rectTransform = CreateRect(objectName, parent);
        Text textComponent = rectTransform.gameObject.AddComponent<Text>();
        textComponent.font = font;
        textComponent.text = string.Empty;
        textComponent.fontSize = fontSize;
        textComponent.fontStyle = fontStyle;
        textComponent.alignment = alignment;
        textComponent.color = new Color(0.93f, 0.94f, 0.9f, 1f);
        textComponent.horizontalOverflow = HorizontalWrapMode.Wrap;
        textComponent.verticalOverflow = VerticalWrapMode.Truncate;
        textComponent.raycastTarget = false;
        return textComponent;
    }

    private static void SetTopAnchored(RectTransform rectTransform, float left, float top, float right, float height)
    {
        rectTransform.anchorMin = new Vector2(0f, 1f);
        rectTransform.anchorMax = new Vector2(1f, 1f);
        rectTransform.offsetMin = new Vector2(left, -top - height);
        rectTransform.offsetMax = new Vector2(right, -top);
    }

    private static void SetTopCentered(RectTransform rectTransform, float width, float top, float height)
    {
        rectTransform.anchorMin = new Vector2(0.5f, 1f);
        rectTransform.anchorMax = new Vector2(0.5f, 1f);
        rectTransform.pivot = new Vector2(0.5f, 1f);
        rectTransform.anchoredPosition = new Vector2(0f, -top);
        rectTransform.sizeDelta = new Vector2(width, height);
    }
}
