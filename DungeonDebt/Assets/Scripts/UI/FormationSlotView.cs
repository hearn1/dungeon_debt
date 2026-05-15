using System;
using UnityEngine;
using UnityEngine.UI;

public class FormationSlotView : MonoBehaviour
{
    private const int Padding = 6;
    private const int SlotLabelFontSize = 14;
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
    [SerializeField] private Text _emptyText;
    [SerializeField] private HeroCardView _card;

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
            _card.gameObject.SetActive(false);
            _card.Clear();
            _emptyText.text = "(empty)";
            _emptyText.enabled = true;
            return;
        }

        _isOccupied = true;
        _background.color = OccupiedColor;
        _emptyText.text = string.Empty;
        _emptyText.enabled = false;
        _card.gameObject.SetActive(true);
        _card.Refresh(hero);
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

        GameObject cardObject = new GameObject("HeroCard", typeof(RectTransform));
        RectTransform cardRect = cardObject.GetComponent<RectTransform>();
        cardRect.SetParent(root, false);
        cardRect.anchorMin = new Vector2(0f, 0f);
        cardRect.anchorMax = new Vector2(1f, 1f);
        cardRect.offsetMin = Vector2.zero;
        cardRect.offsetMax = Vector2.zero;
        _card = cardObject.AddComponent<HeroCardView>();
        _card.Initialize(font);

        _emptyText = CreateText("Empty", root, font, EmptyFontSize, FontStyle.Italic, TextAnchor.MiddleCenter);
        SetAnchored(_emptyText.rectTransform, Padding, Padding, -Padding, -Padding);
        _emptyText.color = new Color(0.5f, 0.5f, 0.55f, 1f);

        // Slot label sits on top of the card in the bottom-right so it stays
        // visible without colliding with the reserved tier slot (top-right).
        _slotLabel = CreateText("SlotLabel", root, font, SlotLabelFontSize, FontStyle.Italic, TextAnchor.LowerRight);
        SetAnchored(_slotLabel.rectTransform, Padding, Padding, -Padding, Padding + 18);
        _slotLabel.color = new Color(0.75f, 0.76f, 0.7f, 1f);
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
