using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class CombatPanelView : MonoBehaviour
{
    private const int Padding = 18;
    private const int TitleHeight = 30;
    private const int RowLabelWidth = 104;
    private const int CardWidth = 128;
    private const int CardHeight = 96;
    private const int CardGap = 18;
    private const int RowGap = 8;
    private const int FrontlineSlots = GameRules.FrontlineSlots;
    private const int BacklineSlots = GameRules.BacklineSlots;
    private const int StabSwordWidth = 40;
    private const int StabSwordHeight = 132;
    private const float StabLungeDuration = 0.10f;
    private const float StabHoldDuration = 0.03f;
    private const float StabRetractDuration = 0.07f;

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
    private Sprite _swordSprite;

    private enum StabPhase { Idle, Lunge, Hold, Retract }
    private Image _stabSword;
    private RectTransform _stabSwordRect;
    private StabPhase _stabPhase = StabPhase.Idle;
    private float _stabT;
    private Vector3 _stabFromLocal;
    private Vector3 _stabToLocal;

    public void Initialize(Font font, Sprite swordSprite)
    {
        _font = font;
        _swordSprite = swordSprite;
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
        ResetStab();
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
            }
            if (targetCard != null)
            {
                bool stabbed = false;
                if (IsWarriorAttacker(evt) && attackerCard != null)
                {
                    stabbed = PlayStab(attackerCard, targetCard);
                }
                if (!stabbed)
                {
                    targetCard.FlashHit();
                }
                targetCard.SetCurrentHealth(evt.TargetHealthAfter, evt.TargetMaxHealth);
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
            }
            if (targetCard != null)
            {
                targetCard.PlayHealGlow();
                targetCard.SetCurrentHealth(evt.TargetHealthAfter, evt.TargetMaxHealth);
            }
            return;
        }

        if (evt.Kind == CombatReplayEventKind.Death)
        {
            CombatUnitCardView targetCard = FindCard(evt.TargetIsPlayerSide, evt.TargetSlot);
            if (targetCard != null)
            {
                targetCard.SetCurrentHealth(0, evt.TargetMaxHealth);
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

    // Board-level traveling stab: a single shared sword sprite lunges from the
    // attacker card to the target card and retracts. Returns false (so the
    // caller falls back to a hit flash) if the sprite/cards are unavailable.
    private bool PlayStab(CombatUnitCardView attackerCard, CombatUnitCardView targetCard)
    {
        if (_stabSword == null || _swordSprite == null || attackerCard == null || targetCard == null)
        {
            return false;
        }

        RectTransform parentRect = _stabSwordRect.parent as RectTransform;
        if (parentRect == null)
        {
            return false;
        }

        Vector3 fromWorld = ((RectTransform)attackerCard.transform).position;
        Vector3 toWorld = ((RectTransform)targetCard.transform).position;
        _stabFromLocal = parentRect.InverseTransformPoint(fromWorld);
        _stabToLocal = parentRect.InverseTransformPoint(toWorld);
        _stabFromLocal.z = 0f;
        _stabToLocal.z = 0f;

        Vector3 dir = _stabToLocal - _stabFromLocal;
        // Sprite is authored pointing up (+Y); rotate so the tip leads toward
        // the target. No spinning — a single fixed aim for the whole thrust.
        float angle = Mathf.Atan2(dir.y, dir.x) * Mathf.Rad2Deg - 90f;

        _stabSword.sprite = _swordSprite;
        _stabSword.enabled = true;
        _stabSword.color = Color.white;
        _stabSwordRect.localRotation = Quaternion.Euler(0f, 0f, angle);
        _stabSwordRect.localPosition = _stabFromLocal;

        _stabPhase = StabPhase.Lunge;
        _stabT = 0f;
        return true;
    }

    private void Update()
    {
        if (_stabPhase == StabPhase.Idle)
        {
            return;
        }

        _stabT += Time.deltaTime;

        if (_stabPhase == StabPhase.Lunge)
        {
            float p = _stabT / StabLungeDuration;
            if (p >= 1f)
            {
                _stabSwordRect.localPosition = _stabToLocal;
                _stabPhase = StabPhase.Hold;
                _stabT = 0f;
                return;
            }
            // Ease-out so the thrust snaps forward.
            float eased = 1f - ((1f - p) * (1f - p));
            _stabSwordRect.localPosition = Vector3.Lerp(_stabFromLocal, _stabToLocal, eased);
            return;
        }

        if (_stabPhase == StabPhase.Hold)
        {
            if (_stabT >= StabHoldDuration)
            {
                _stabPhase = StabPhase.Retract;
                _stabT = 0f;
            }
            return;
        }

        // Retract.
        float r = _stabT / StabRetractDuration;
        if (r >= 1f)
        {
            ResetStab();
            return;
        }
        _stabSwordRect.localPosition = Vector3.Lerp(_stabToLocal, _stabFromLocal, r);
    }

    private void ResetStab()
    {
        _stabPhase = StabPhase.Idle;
        _stabT = 0f;
        if (_stabSword != null)
        {
            _stabSword.enabled = false;
        }
    }

    private static bool IsWarriorAttacker(CombatReplayEvent evt)
    {
        if (evt == null || !evt.AttackerIsPlayerSide || string.IsNullOrEmpty(evt.AttackerHeroId))
        {
            return false;
        }
        return evt.AttackerHeroId == "warrior";
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
            }
            else
            {
                cards[i].Clear();
            }
        }
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
            layoutElement.preferredWidth = CardWidth;
            layoutElement.preferredHeight = CardHeight;
            CombatUnitCardView card = cardRect.gameObject.AddComponent<CombatUnitCardView>();
            card.Initialize(_font);
            cards.Add(card);
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
        // renders above every card row during the traveling-stab animation.
        RectTransform swordRect = CreateRect("StabSword", root);
        swordRect.anchorMin = new Vector2(0.5f, 0.5f);
        swordRect.anchorMax = new Vector2(0.5f, 0.5f);
        swordRect.pivot = new Vector2(0.5f, 0.5f);
        swordRect.sizeDelta = new Vector2(StabSwordWidth, StabSwordHeight);
        swordRect.localPosition = Vector3.zero;
        _stabSword = swordRect.gameObject.AddComponent<Image>();
        _stabSword.raycastTarget = false;
        _stabSword.preserveAspect = true;
        _stabSword.enabled = false;
        _stabSwordRect = swordRect;
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
