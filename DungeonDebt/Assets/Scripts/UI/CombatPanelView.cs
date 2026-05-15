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

    public void Initialize(Font font)
    {
        _font = font;
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
    }

    public void Hide()
    {
        gameObject.SetActive(false);
    }

    public void Show()
    {
        gameObject.SetActive(true);
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
