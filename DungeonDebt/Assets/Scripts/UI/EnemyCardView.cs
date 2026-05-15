using UnityEngine;
using UnityEngine.UI;

public class EnemyCardView : MonoBehaviour
{
    private const int Padding = 8;
    private const int NameFontSize = 16;
    private const int StatsFontSize = 14;
    private const int EffectFontSize = 12;

    [SerializeField] private Text _nameText;
    [SerializeField] private Text _statsText;
    [SerializeField] private Text _effectText;

    public void Initialize(Font font)
    {
        BuildUi(font);
        Clear();
    }

    public void Refresh(EnemyDefinition enemy)
    {
        if (enemy == null)
        {
            Clear();
            return;
        }

        _nameText.text = enemy.DisplayName;
        _statsText.text = "ATK " + enemy.Attack + "    HP " + enemy.Health;
        _effectText.text = string.IsNullOrEmpty(enemy.EffectDescription) ? "No effect." : enemy.EffectDescription;
    }

    public void Clear()
    {
        if (_nameText != null)
        {
            _nameText.text = string.Empty;
        }
        if (_statsText != null)
        {
            _statsText.text = string.Empty;
        }
        if (_effectText != null)
        {
            _effectText.text = string.Empty;
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

        background.color = new Color(0.22f, 0.16f, 0.16f, 1f);
        background.raycastTarget = false;

        // Name reserves room for 2 wrapped lines (some enemies have multi-word names like "Carry Protector").
        _nameText = CreateText("Name", root, font, NameFontSize, FontStyle.Bold, TextAnchor.UpperLeft);
        SetAnchored(_nameText.rectTransform, Padding, -Padding - 44, -Padding, -Padding);

        _statsText = CreateText("Stats", root, font, StatsFontSize, FontStyle.Normal, TextAnchor.UpperLeft);
        SetAnchored(_statsText.rectTransform, Padding, -Padding - 68, -Padding, -Padding - 48);

        _effectText = CreateText("Effect", root, font, EffectFontSize, FontStyle.Italic, TextAnchor.UpperLeft);
        _effectText.verticalOverflow = VerticalWrapMode.Overflow;
        SetAnchored(_effectText.rectTransform, Padding, Padding, -Padding, -Padding - 72);
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
        textComponent.color = new Color(0.94f, 0.92f, 0.88f, 1f);
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
