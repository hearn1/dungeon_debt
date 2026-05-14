using System;
using UnityEngine;
using UnityEngine.UI;

public class FormationSlotView : MonoBehaviour
{
    private const int Padding = 10;
    private const int NameFontSize = 20;
    private const int StatsFontSize = 16;
    private const int RoleFontSize = 14;
    private const int EmptyFontSize = 22;
    private const int HighlightThickness = 4;

    private static readonly Color OccupiedColor = new Color(0.20f, 0.22f, 0.27f, 1f);
    private static readonly Color EmptyColor = new Color(0.12f, 0.13f, 0.16f, 1f);
    private static readonly Color HighlightColor = new Color(0.95f, 0.78f, 0.25f, 1f);
    private static readonly Color HighlightHiddenColor = new Color(0f, 0f, 0f, 0f);

    [SerializeField] private Button _button;
    [SerializeField] private Image _background;
    [SerializeField] private Image _highlight;
    [SerializeField] private Text _slotLabel;
    [SerializeField] private Text _nameText;
    [SerializeField] private Text _statsText;
    [SerializeField] private Text _roleText;
    [SerializeField] private Text _emptyText;

    private int _slotIndex;
    private Action<int> _onClick;
    private bool _isOccupied;

    public int SlotIndex
    {
        get { return _slotIndex; }
    }

    public bool IsOccupied
    {
        get { return _isOccupied; }
    }

    public void Initialize(int slotIndex, Font font, Action<int> onClick)
    {
        _slotIndex = slotIndex;
        _onClick = onClick;
        BuildUi(font);
        _button.onClick.AddListener(HandleClick);
        Refresh(null);
        SetSelected(false);
    }

    public void Refresh(HeroInstance hero)
    {
        if (hero == null)
        {
            _isOccupied = false;
            _background.color = EmptyColor;
            _nameText.text = string.Empty;
            _statsText.text = string.Empty;
            _roleText.text = string.Empty;
            _emptyText.text = "(empty)";
            return;
        }

        _isOccupied = true;
        _background.color = OccupiedColor;
        _emptyText.text = string.Empty;
        _nameText.text = hero.Definition.DisplayName;
        _statsText.text = "ATK " + hero.Attack + " / HP " + hero.Definition.BaseHealth + " / Up " + hero.UpkeepThisRound;
        _roleText.text = hero.Definition.Role.ToString();
    }

    public void SetSelected(bool selected)
    {
        _highlight.color = selected ? HighlightColor : HighlightHiddenColor;
    }

    public void SetSlotLabel(string label)
    {
        _slotLabel.text = label;
    }

    private void OnDestroy()
    {
        if (_button != null)
        {
            _button.onClick.RemoveListener(HandleClick);
        }
    }

    private void HandleClick()
    {
        if (_onClick != null)
        {
            _onClick(_slotIndex);
        }
    }

    private void BuildUi(Font font)
    {
        RectTransform root = GetComponent<RectTransform>();
        if (root == null)
        {
            root = gameObject.AddComponent<RectTransform>();
        }

        _highlight = CreatePanel("Highlight", root, HighlightHiddenColor).GetComponent<Image>();
        RectTransform highlightRect = _highlight.GetComponent<RectTransform>();
        highlightRect.anchorMin = new Vector2(0f, 0f);
        highlightRect.anchorMax = new Vector2(1f, 1f);
        highlightRect.offsetMin = new Vector2(-HighlightThickness, -HighlightThickness);
        highlightRect.offsetMax = new Vector2(HighlightThickness, HighlightThickness);
        _highlight.raycastTarget = false;

        _background = CreatePanel("Background", root, OccupiedColor).GetComponent<Image>();
        RectTransform backgroundRect = _background.GetComponent<RectTransform>();
        backgroundRect.anchorMin = new Vector2(0f, 0f);
        backgroundRect.anchorMax = new Vector2(1f, 1f);
        backgroundRect.offsetMin = Vector2.zero;
        backgroundRect.offsetMax = Vector2.zero;
        _background.raycastTarget = true;

        _button = _background.gameObject.AddComponent<Button>();
        _button.targetGraphic = _background;

        _slotLabel = CreateText("SlotLabel", backgroundRect, font, RoleFontSize, FontStyle.Italic, TextAnchor.UpperRight);
        SetAnchored(_slotLabel.rectTransform, Padding, -Padding - 20, -Padding, -Padding);
        _slotLabel.color = new Color(0.7f, 0.72f, 0.65f, 1f);

        _nameText = CreateText("Name", backgroundRect, font, NameFontSize, FontStyle.Bold, TextAnchor.UpperLeft);
        SetAnchored(_nameText.rectTransform, Padding, -Padding - 28, -Padding - 30, -Padding);

        _statsText = CreateText("Stats", backgroundRect, font, StatsFontSize, FontStyle.Normal, TextAnchor.UpperLeft);
        SetAnchored(_statsText.rectTransform, Padding, -Padding - 54, -Padding, -Padding - 30);

        _roleText = CreateText("Role", backgroundRect, font, RoleFontSize, FontStyle.Italic, TextAnchor.LowerLeft);
        SetAnchored(_roleText.rectTransform, Padding, Padding, -Padding, Padding + 22);
        _roleText.color = new Color(0.75f, 0.76f, 0.7f, 1f);

        _emptyText = CreateText("Empty", backgroundRect, font, EmptyFontSize, FontStyle.Italic, TextAnchor.MiddleCenter);
        SetAnchored(_emptyText.rectTransform, Padding, Padding, -Padding, -Padding);
        _emptyText.color = new Color(0.5f, 0.5f, 0.55f, 1f);
    }

    private static RectTransform CreatePanel(string objectName, RectTransform parent, Color color)
    {
        GameObject child = new GameObject(objectName, typeof(RectTransform));
        RectTransform rectTransform = child.GetComponent<RectTransform>();
        rectTransform.SetParent(parent, false);
        Image image = child.AddComponent<Image>();
        image.color = color;
        return rectTransform;
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
