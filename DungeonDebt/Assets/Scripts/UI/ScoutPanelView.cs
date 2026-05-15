using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class ScoutPanelView : MonoBehaviour
{
    private const int TitleHeight = 44;
    private const int TitleTopOffset = 20;
    private const int TypeHeight = 28;
    private const int TypeTopOffset = 72;
    private const int ScoutTextHeight = 120;
    private const int ScoutTextTopOffset = 110;
    private const int RewardHeight = 32;
    private const int RewardTopOffset = 240;
    private const int DangerHeight = 28;
    private const int DangerTopOffset = 280;
    private const int EnemiesRowHeight = 180;
    private const int EnemiesRowTopOffset = 316;
    private const int ContinueButtonWidth = 260;
    private const int ContinueButtonHeight = 60;
    private const int ContinueButtonTopOffset = 520;
    private const int ContentWidth = 700;
    private const int EnemyCardWidth = 130;
    private const int EnemyCardGap = 8;

    [SerializeField] private Text _titleText;
    [SerializeField] private Text _typeText;
    [SerializeField] private Text _scoutText;
    [SerializeField] private Text _rewardText;
    [SerializeField] private Text _dangerText;
    [SerializeField] private RectTransform _enemiesRow;
    [SerializeField] private Button _continueButton;

    private readonly List<EnemyCardView> _enemyCards = new List<EnemyCardView>();

    private Font _font;
    private Action _onContinue;

    public void Initialize(Font font)
    {
        _font = font;
        BuildUi();
        Hide();
    }

    public void SetOnContinue(Action onContinue)
    {
        _onContinue = onContinue;
    }

    public void Show()
    {
        gameObject.SetActive(true);
    }

    public void Hide()
    {
        gameObject.SetActive(false);
    }

    public void Refresh(RunState runState)
    {
        EncounterDefinition encounter = runState != null ? runState.CurrentEncounter : null;
        int round = runState != null ? runState.Round : 0;

        if (encounter == null)
        {
            _titleText.text = "Scout";
            _typeText.text = string.Empty;
            _scoutText.text = "No encounter loaded.";
            _rewardText.text = string.Empty;
            _dangerText.text = string.Empty;
            RefreshEnemyCards(null);
            return;
        }

        _titleText.text = "Round " + round + " — " + encounter.DisplayName;
        _typeText.text = FormatType(encounter.Type);
        _scoutText.text = encounter.ScoutText;
        _rewardText.text = "Reward: " + encounter.BaseGoldReward + " gold";
        _dangerText.text = string.IsNullOrEmpty(encounter.DangerCategory)
            ? string.Empty
            : "Danger: " + encounter.DangerCategory;
        RefreshEnemyCards(encounter.Enemies);
    }

    private void RefreshEnemyCards(IReadOnlyList<EnemyDefinition> enemies)
    {
        int needed = enemies != null ? enemies.Count : 0;

        while (_enemyCards.Count < needed)
        {
            _enemyCards.Add(BuildEnemyCard(_enemyCards.Count));
        }

        int totalWidth = needed > 0 ? (needed * EnemyCardWidth) + ((needed - 1) * EnemyCardGap) : 0;
        int startX = -(totalWidth / 2);

        for (int i = 0; i < _enemyCards.Count; i++)
        {
            EnemyCardView card = _enemyCards[i];
            if (i < needed)
            {
                card.gameObject.SetActive(true);
                card.Refresh(enemies[i]);
                RectTransform cardRect = card.GetComponent<RectTransform>();
                cardRect.anchoredPosition = new Vector2(startX + (i * (EnemyCardWidth + EnemyCardGap)), 0f);
            }
            else
            {
                card.gameObject.SetActive(false);
                card.Clear();
            }
        }
    }

    private EnemyCardView BuildEnemyCard(int index)
    {
        GameObject cardObject = new GameObject("EnemyCard_" + index, typeof(RectTransform));
        RectTransform rect = cardObject.GetComponent<RectTransform>();
        rect.SetParent(_enemiesRow, false);
        rect.anchorMin = new Vector2(0.5f, 0f);
        rect.anchorMax = new Vector2(0.5f, 1f);
        rect.pivot = new Vector2(0f, 0.5f);
        rect.sizeDelta = new Vector2(EnemyCardWidth, 0f);
        rect.anchoredPosition = Vector2.zero;

        EnemyCardView view = cardObject.AddComponent<EnemyCardView>();
        view.Initialize(_font);
        return view;
    }

    private static string FormatType(EncounterType type)
    {
        switch (type)
        {
            case EncounterType.Dungeon:
                return "Dungeon";
            case EncounterType.RivalGhost:
                return "Rival Ghost";
            case EncounterType.FinalBoss:
                return "Final Boss";
            default:
                return type.ToString();
        }
    }

    private void OnDestroy()
    {
        if (_continueButton != null)
        {
            _continueButton.onClick.RemoveListener(HandleContinueClicked);
        }
    }

    private void HandleContinueClicked()
    {
        if (_onContinue != null)
        {
            _onContinue();
        }
    }

    private void BuildUi()
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

        background.color = new Color(0.11f, 0.12f, 0.15f, 1f);
        background.raycastTarget = false;

        _titleText = CreateText("Title", root, _font, 32, FontStyle.Bold, TextAnchor.MiddleCenter);
        AnchorTopCentered(_titleText.rectTransform, ContentWidth, TitleHeight, TitleTopOffset);
        _titleText.text = "Scout";

        _typeText = CreateText("Type", root, _font, 22, FontStyle.Italic, TextAnchor.MiddleCenter);
        AnchorTopCentered(_typeText.rectTransform, ContentWidth, TypeHeight, TypeTopOffset);
        _typeText.color = new Color(0.75f, 0.76f, 0.7f, 1f);

        _scoutText = CreateText("ScoutText", root, _font, 24, FontStyle.Normal, TextAnchor.UpperCenter);
        AnchorTopCentered(_scoutText.rectTransform, ContentWidth, ScoutTextHeight, ScoutTextTopOffset);

        _rewardText = CreateText("Reward", root, _font, 22, FontStyle.Bold, TextAnchor.MiddleCenter);
        AnchorTopCentered(_rewardText.rectTransform, ContentWidth, RewardHeight, RewardTopOffset);

        _dangerText = CreateText("Danger", root, _font, 18, FontStyle.Italic, TextAnchor.MiddleCenter);
        AnchorTopCentered(_dangerText.rectTransform, ContentWidth, DangerHeight, DangerTopOffset);
        _dangerText.color = new Color(0.85f, 0.65f, 0.55f, 1f);

        GameObject enemiesObject = new GameObject("EnemiesRow", typeof(RectTransform));
        _enemiesRow = enemiesObject.GetComponent<RectTransform>();
        _enemiesRow.SetParent(root, false);
        AnchorTopCentered(_enemiesRow, ContentWidth, EnemiesRowHeight, EnemiesRowTopOffset);

        _continueButton = CreateContinueButton(root, _font, "Continue to Shop");
        AnchorTopCentered(_continueButton.GetComponent<RectTransform>(), ContinueButtonWidth, ContinueButtonHeight, ContinueButtonTopOffset);
        _continueButton.onClick.AddListener(HandleContinueClicked);
    }

    private Button CreateContinueButton(RectTransform parent, Font font, string label)
    {
        GameObject buttonObject = new GameObject("ContinueButton", typeof(RectTransform));
        RectTransform rectTransform = buttonObject.GetComponent<RectTransform>();
        rectTransform.SetParent(parent, false);
        Image image = buttonObject.AddComponent<Image>();
        image.color = new Color(0.78f, 0.69f, 0.41f, 1f);
        image.raycastTarget = true;

        Button button = buttonObject.AddComponent<Button>();
        button.targetGraphic = image;

        Text buttonLabel = CreateText("Label", rectTransform, font, 22, FontStyle.Bold, TextAnchor.MiddleCenter);
        buttonLabel.color = new Color(0.08f, 0.08f, 0.09f, 1f);
        buttonLabel.text = label;
        RectTransform textRect = buttonLabel.rectTransform;
        textRect.anchorMin = new Vector2(0f, 0f);
        textRect.anchorMax = new Vector2(1f, 1f);
        textRect.offsetMin = new Vector2(12f, 8f);
        textRect.offsetMax = new Vector2(-12f, -8f);

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
        textComponent.verticalOverflow = VerticalWrapMode.Overflow;
        textComponent.raycastTarget = false;
        return textComponent;
    }

    private static void AnchorTopCentered(RectTransform rectTransform, float width, float height, float topOffset)
    {
        rectTransform.anchorMin = new Vector2(0.5f, 1f);
        rectTransform.anchorMax = new Vector2(0.5f, 1f);
        rectTransform.pivot = new Vector2(0.5f, 1f);
        rectTransform.anchoredPosition = new Vector2(0f, -topOffset);
        rectTransform.sizeDelta = new Vector2(width, height);
    }
}
