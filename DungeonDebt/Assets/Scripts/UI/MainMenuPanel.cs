using UnityEngine;
using UnityEngine.UI;

public class MainMenuPanel : MonoBehaviour
{
    private const int HorizontalMargin = 140;
    private const int TopMargin = 80;
    private const int ButtonWidth = 260;
    private const int ButtonHeight = 64;
    private const int ButtonGap = 28;

    [SerializeField] private Button _startCombatButton;
    [SerializeField] private Button _restartButton;
    [SerializeField] private Text _statusText;
    [SerializeField] private Text _resultText;
    [SerializeField] private CombatLogView _combatLogView;

    private static Font _runtimeFont;


    private void Awake()
    {
        BuildUi();
        _startCombatButton.onClick.AddListener(StartCombat);
        _restartButton.onClick.AddListener(RestartCombat);
        ResetUi();
    }

    private void OnDestroy()
    {
        if (_startCombatButton != null)
        {
            _startCombatButton.onClick.RemoveListener(StartCombat);
        }

        if (_restartButton != null)
        {
            _restartButton.onClick.RemoveListener(RestartCombat);
        }
    }

    private void StartCombat()
    {
        RunSandboxCombat();
    }

    private void RestartCombat()
    {
        RunSandboxCombat();
    }

    private void ResetUi()
    {
        _statusText.text = "Ready";
        _resultText.text = string.Empty;
        _startCombatButton.interactable = true;
        _restartButton.interactable = false;
        _combatLogView.Clear();
    }

    private void RunSandboxCombat()
    {
        _startCombatButton.interactable = false;
        _restartButton.interactable = false;
        _statusText.text = "Combat running...";
        _resultText.text = string.Empty;

        RunState run = DataRepository.CreateSandboxRun();
        EncounterDefinition encounter = DataRepository.SandboxEncounter;
        CombatResult result = new CombatManager().StartCombat(run, encounter);

        _combatLogView.StreamLines(result.LogLines, delegate
        {
            _statusText.text = "Combat complete";
            _resultText.text = result.PlayerWon ? "Result: Player wins!" : "Result: Player loses.";
            _restartButton.interactable = true;
        });
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

        background.color = new Color(0.09f, 0.1f, 0.12f, 1f);
        background.raycastTarget = false;

        Text titleText = CreateText("Title", root, "Dungeon Debt", 56, FontStyle.Bold, TextAnchor.MiddleCenter);
        SetAnchoredRect(titleText.rectTransform, 0.5f, 1f, 0.5f, 1f, 0f, -TopMargin, 720f, 76f);

        _statusText = CreateText("StatusText", root, "Ready", 26, FontStyle.Normal, TextAnchor.MiddleCenter);
        SetAnchoredRect(_statusText.rectTransform, 0.5f, 1f, 0.5f, 1f, 0f, -160f, 700f, 44f);

        RectTransform buttonRow = CreateRect("ButtonRow", root);
        SetAnchoredRect(buttonRow, 0.5f, 1f, 0.5f, 1f, 0f, -245f, (ButtonWidth * 2) + ButtonGap, ButtonHeight);

        _startCombatButton = CreateButton("StartCombatButton", buttonRow, "Start Combat");
        SetAnchoredRect(_startCombatButton.GetComponent<RectTransform>(), 0f, 0.5f, 0f, 0.5f, ButtonWidth * 0.5f, 0f, ButtonWidth, ButtonHeight);

        _restartButton = CreateButton("RestartButton", buttonRow, "Restart");
        SetAnchoredRect(_restartButton.GetComponent<RectTransform>(), 1f, 0.5f, 1f, 0.5f, -ButtonWidth * 0.5f, 0f, ButtonWidth, ButtonHeight);

        RectTransform logPanel = CreatePanel("CombatLogPanel", root, new Color(0.16f, 0.17f, 0.2f, 1f));
        SetAnchoredRect(logPanel, 0f, 0f, 1f, 1f, HorizontalMargin, 100f, -HorizontalMargin, -320f);

        Text logText = CreateText("CombatLogText", logPanel, string.Empty, 24, FontStyle.Normal, TextAnchor.UpperLeft);
        SetAnchoredRect(logText.rectTransform, 0f, 0f, 1f, 1f, 32f, 24f, -32f, -24f);

        _combatLogView = logPanel.gameObject.AddComponent<CombatLogView>();
        _combatLogView.Initialize(logText);

        _resultText = CreateText("ResultText", root, string.Empty, 32, FontStyle.Bold, TextAnchor.MiddleCenter);
        SetAnchoredRect(_resultText.rectTransform, 0.5f, 0f, 0.5f, 0f, 0f, 45f, 800f, 52f);
    }

    private static RectTransform CreateRect(string objectName, RectTransform parent)
    {
        GameObject child = new GameObject(objectName, typeof(RectTransform));
        RectTransform rectTransform = child.GetComponent<RectTransform>();
        rectTransform.SetParent(parent, false);
        return rectTransform;
    }

    private static RectTransform CreatePanel(string objectName, RectTransform parent, Color color)
    {
        RectTransform rectTransform = CreateRect(objectName, parent);
        Image image = rectTransform.gameObject.AddComponent<Image>();
        image.color = color;
        image.raycastTarget = false;
        return rectTransform;
    }

    private static Text CreateText(string objectName, RectTransform parent, string text, int fontSize, FontStyle fontStyle, TextAnchor alignment)
    {
        RectTransform rectTransform = CreateRect(objectName, parent);
        Text textComponent = rectTransform.gameObject.AddComponent<Text>();
        textComponent.font = GetRuntimeFont();
        textComponent.text = text;
        textComponent.fontSize = fontSize;
        textComponent.fontStyle = fontStyle;
        textComponent.alignment = alignment;
        textComponent.color = new Color(0.93f, 0.94f, 0.9f, 1f);
        textComponent.horizontalOverflow = HorizontalWrapMode.Wrap;
        textComponent.verticalOverflow = VerticalWrapMode.Truncate;
        textComponent.raycastTarget = false;
        return textComponent;
    }

    private static Font GetRuntimeFont()
    {
        if (_runtimeFont != null)
        {
            return _runtimeFont;
        }

        _runtimeFont = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
        if (_runtimeFont == null)
        {
            _runtimeFont = Font.CreateDynamicFontFromOSFont(new[] { "Arial", "Segoe UI", "Liberation Sans" }, 16);
        }

        return _runtimeFont;
    }

    private static Button CreateButton(string objectName, RectTransform parent, string label)
    {
        RectTransform rectTransform = CreatePanel(objectName, parent, new Color(0.78f, 0.69f, 0.41f, 1f));
        Button button = rectTransform.gameObject.AddComponent<Button>();
        Image buttonImage = rectTransform.GetComponent<Image>();
        buttonImage.raycastTarget = true;
        button.targetGraphic = buttonImage;

        Text buttonText = CreateText("Label", rectTransform, label, 24, FontStyle.Bold, TextAnchor.MiddleCenter);
        buttonText.color = new Color(0.08f, 0.08f, 0.09f, 1f);
        SetAnchoredRect(buttonText.rectTransform, 0f, 0f, 1f, 1f, 12f, 8f, -12f, -8f);

        return button;
    }

    private static void SetAnchoredRect(RectTransform rectTransform, float anchorMinX, float anchorMinY, float anchorMaxX, float anchorMaxY, float leftOrCenterX, float bottomOrCenterY, float rightOrWidth, float topOrHeight)
    {
        rectTransform.anchorMin = new Vector2(anchorMinX, anchorMinY);
        rectTransform.anchorMax = new Vector2(anchorMaxX, anchorMaxY);

        if (anchorMinX == anchorMaxX && anchorMinY == anchorMaxY)
        {
            rectTransform.anchoredPosition = new Vector2(leftOrCenterX, bottomOrCenterY);
            rectTransform.sizeDelta = new Vector2(rightOrWidth, topOrHeight);
            return;
        }

        rectTransform.offsetMin = new Vector2(leftOrCenterX, bottomOrCenterY);
        rectTransform.offsetMax = new Vector2(rightOrWidth, topOrHeight);
    }
}
