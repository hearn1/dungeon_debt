using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class ShopPanelView : MonoBehaviour
{
    private const int Padding = 16;
    private const int TitleHeight = 40;
    private const int FooterHeight = 64;
    private const int OfferWidth = 280;
    private const int OfferHeight = 200;
    private const int OfferGap = 16;
    private const int PartyRowHeight = 64;
    private const int PartyRowGap = 8;
    private const int FireButtonWidth = 88;

    [SerializeField] private Text _titleText;
    [SerializeField] private Text _goldText;
    [SerializeField] private Text _partyTitleText;
    [SerializeField] private RectTransform _offersRow;
    [SerializeField] private RectTransform _partyColumn;
    [SerializeField] private Button _rerollButton;
    [SerializeField] private Text _rerollLabel;
    [SerializeField] private Button _continueButton;
    [SerializeField] private Text _continueLabel;

    private readonly List<ShopOfferView> _offerViews = new List<ShopOfferView>();
    private readonly List<GameObject> _partyRows = new List<GameObject>();
    private readonly List<Button> _partyFireButtons = new List<Button>();

    private Font _font;

    private Action<int> _onHire;
    private Action<int> _onFire;
    private Action _onReroll;
    private Action _onContinue;

    public void Initialize(Font font)
    {
        _font = font;
        BuildUi(font);
    }

    public void SetHandlers(Action<int> onHire, Action<int> onFire, Action onReroll, Action onContinue)
    {
        _onHire = onHire;
        _onFire = onFire;
        _onReroll = onReroll;
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

    public void Refresh(RunState runState, IReadOnlyList<ShopOffer> offers)
    {
        if (runState == null)
        {
            return;
        }

        _goldText.text = "Gold: " + runState.Gold + "    Party: " + runState.Party.Count + " / " + GameRules.MaxPartySize;

        bool partyFull = runState.Party.Count >= GameRules.MaxPartySize;
        int offerCount = offers != null ? offers.Count : 0;

        for (int i = 0; i < _offerViews.Count; i++)
        {
            ShopOffer offer = i < offerCount ? offers[i] : null;
            bool isUpgrade = offer != null
                && offer.Hero != null
                && offer.Tier == HeroTier.Bronze
                && IsBronzeOwnedDuplicate(runState, offer.Hero);
            _offerViews[i].Refresh(offer, runState.Gold, partyFull, isUpgrade);
        }

        RefreshPartyList(runState);

        _rerollButton.interactable = runState.Gold >= GameRules.RerollCost;
        _rerollLabel.text = "Reroll (" + GameRules.RerollCost + "g)";
        _continueButton.interactable = true;
        _continueLabel.text = "Continue to Combat";
    }

    private static bool IsBronzeOwnedDuplicate(RunState runState, HeroDefinition hero)
    {
        if (runState == null || hero == null)
        {
            return false;
        }

        for (int i = 0; i < runState.Party.Count; i++)
        {
            HeroInstance member = runState.Party[i];
            if (member != null && member.Definition != null
                && member.Definition.Id == hero.Id
                && member.Tier == HeroTier.Bronze)
            {
                return true;
            }
        }

        return false;
    }

    private void RefreshPartyList(RunState runState)
    {
        int needed = GameRules.MaxPartySize;
        while (_partyRows.Count < needed)
        {
            int rowIndex = _partyRows.Count;
            GameObject row = BuildPartyRow(rowIndex);
            _partyRows.Add(row);
        }

        for (int i = 0; i < _partyRows.Count; i++)
        {
            GameObject rowObject = _partyRows[i];
            RectTransform rowRect = rowObject.GetComponent<RectTransform>();
            rowRect.anchorMin = new Vector2(0f, 1f);
            rowRect.anchorMax = new Vector2(1f, 1f);
            rowRect.pivot = new Vector2(0.5f, 1f);
            float top = -(i * (PartyRowHeight + PartyRowGap));
            rowRect.offsetMin = new Vector2(0f, top - PartyRowHeight);
            rowRect.offsetMax = new Vector2(0f, top);

            Text nameText = rowObject.transform.Find("Name").GetComponent<Text>();
            Text statsText = rowObject.transform.Find("Stats").GetComponent<Text>();
            Button fireButton = _partyFireButtons[i];

            if (i < runState.Party.Count)
            {
                HeroInstance hero = runState.Party[i];
                nameText.text = (i + 1) + ". " + hero.Definition.DisplayName + " (" + hero.Definition.Role + ")";
                statsText.text = "ATK " + hero.Attack + " / HP " + hero.CurrentHealth + " / Upkeep " + hero.UpkeepThisRound;
                fireButton.gameObject.SetActive(true);
                fireButton.interactable = true;
            }
            else
            {
                nameText.text = (i + 1) + ". (empty)";
                statsText.text = string.Empty;
                fireButton.gameObject.SetActive(false);
            }
        }
    }

    private GameObject BuildPartyRow(int rowIndex)
    {
        GameObject row = new GameObject("PartyRow_" + rowIndex, typeof(RectTransform));
        RectTransform rect = row.GetComponent<RectTransform>();
        rect.SetParent(_partyColumn, false);

        Image rowImage = row.AddComponent<Image>();
        rowImage.color = new Color(0.16f, 0.17f, 0.2f, 1f);
        rowImage.raycastTarget = false;

        Text nameText = CreateText("Name", rect, _font, 18, FontStyle.Bold, TextAnchor.UpperLeft);
        Text statsText = CreateText("Stats", rect, _font, 14, FontStyle.Normal, TextAnchor.LowerLeft);

        RectTransform nameRect = nameText.rectTransform;
        nameRect.anchorMin = new Vector2(0f, 0f);
        nameRect.anchorMax = new Vector2(1f, 1f);
        nameRect.offsetMin = new Vector2(10f, 4f);
        nameRect.offsetMax = new Vector2(-FireButtonWidth - 16f, -4f);

        RectTransform statsRect = statsText.rectTransform;
        statsRect.anchorMin = new Vector2(0f, 0f);
        statsRect.anchorMax = new Vector2(1f, 1f);
        statsRect.offsetMin = new Vector2(10f, 4f);
        statsRect.offsetMax = new Vector2(-FireButtonWidth - 16f, -4f);

        Text fireLabel;
        Button fireButton = CreateButton("FireButton", rect, _font, "Fire", out fireLabel);
        RectTransform fireRect = fireButton.GetComponent<RectTransform>();
        fireRect.anchorMin = new Vector2(1f, 0.5f);
        fireRect.anchorMax = new Vector2(1f, 0.5f);
        fireRect.pivot = new Vector2(1f, 0.5f);
        fireRect.anchoredPosition = new Vector2(-10f, 0f);
        fireRect.sizeDelta = new Vector2(FireButtonWidth, 40f);

        int capturedIndex = rowIndex;
        fireButton.onClick.AddListener(delegate { HandleFireClicked(capturedIndex); });
        _partyFireButtons.Add(fireButton);
        return row;
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

        background.color = new Color(0.10f, 0.11f, 0.13f, 1f);
        background.raycastTarget = true;

        _titleText = CreateText("Title", root, font, 32, FontStyle.Bold, TextAnchor.UpperLeft);
        RectTransform titleRect = _titleText.rectTransform;
        titleRect.anchorMin = new Vector2(0f, 1f);
        titleRect.anchorMax = new Vector2(0.5f, 1f);
        titleRect.offsetMin = new Vector2(Padding, -Padding - TitleHeight);
        titleRect.offsetMax = new Vector2(-Padding, -Padding);
        _titleText.text = "Shop";

        _goldText = CreateText("Gold", root, font, 22, FontStyle.Bold, TextAnchor.UpperRight);
        RectTransform goldRect = _goldText.rectTransform;
        goldRect.anchorMin = new Vector2(0.5f, 1f);
        goldRect.anchorMax = new Vector2(1f, 1f);
        goldRect.offsetMin = new Vector2(Padding, -Padding - TitleHeight);
        goldRect.offsetMax = new Vector2(-Padding, -Padding);

        _offersRow = CreateRect("OffersRow", root);
        _offersRow.anchorMin = new Vector2(0f, 0f);
        _offersRow.anchorMax = new Vector2(0f, 1f);
        _offersRow.pivot = new Vector2(0f, 0.5f);
        _offersRow.offsetMin = new Vector2(Padding, Padding + FooterHeight);
        _offersRow.offsetMax = new Vector2(Padding + (OfferWidth * GameRules.ShopOfferCount) + (OfferGap * (GameRules.ShopOfferCount - 1)), -Padding - TitleHeight - Padding);

        for (int i = 0; i < GameRules.ShopOfferCount; i++)
        {
            GameObject offerObj = new GameObject("Offer_" + i, typeof(RectTransform));
            RectTransform offerRect = offerObj.GetComponent<RectTransform>();
            offerRect.SetParent(_offersRow, false);
            offerRect.anchorMin = new Vector2(0f, 0f);
            offerRect.anchorMax = new Vector2(0f, 1f);
            offerRect.pivot = new Vector2(0f, 0.5f);
            float left = i * (OfferWidth + OfferGap);
            offerRect.offsetMin = new Vector2(left, 0f);
            offerRect.offsetMax = new Vector2(left + OfferWidth, 0f);

            ShopOfferView offerView = offerObj.AddComponent<ShopOfferView>();
            offerView.Initialize(font);
            int capturedIndex = i;
            offerView.SetOnHire(delegate { HandleHireClicked(capturedIndex); });
            _offerViews.Add(offerView);
        }

        _partyTitleText = CreateText("PartyTitle", root, font, 22, FontStyle.Bold, TextAnchor.UpperLeft);
        RectTransform partyTitleRect = _partyTitleText.rectTransform;
        float partyLeftOffset = Padding + (OfferWidth * GameRules.ShopOfferCount) + (OfferGap * GameRules.ShopOfferCount);
        partyTitleRect.anchorMin = new Vector2(0f, 1f);
        partyTitleRect.anchorMax = new Vector2(1f, 1f);
        partyTitleRect.offsetMin = new Vector2(partyLeftOffset, -Padding - TitleHeight - Padding - 30);
        partyTitleRect.offsetMax = new Vector2(-Padding, -Padding - TitleHeight - Padding);
        _partyTitleText.text = "Party";

        _partyColumn = CreateRect("PartyColumn", root);
        _partyColumn.anchorMin = new Vector2(0f, 0f);
        _partyColumn.anchorMax = new Vector2(1f, 1f);
        _partyColumn.pivot = new Vector2(0.5f, 1f);
        _partyColumn.offsetMin = new Vector2(partyLeftOffset, Padding + FooterHeight);
        _partyColumn.offsetMax = new Vector2(-Padding, -Padding - TitleHeight - Padding - 36);

        _rerollButton = CreateButton("RerollButton", root, font, "Reroll", out _rerollLabel);
        RectTransform rerollRect = _rerollButton.GetComponent<RectTransform>();
        rerollRect.anchorMin = new Vector2(0f, 0f);
        rerollRect.anchorMax = new Vector2(0f, 0f);
        rerollRect.pivot = new Vector2(0f, 0f);
        rerollRect.anchoredPosition = new Vector2(Padding, Padding);
        rerollRect.sizeDelta = new Vector2(220f, FooterHeight - 8f);

        _continueButton = CreateButton("ContinueButton", root, font, "Continue", out _continueLabel);
        RectTransform continueRect = _continueButton.GetComponent<RectTransform>();
        continueRect.anchorMin = new Vector2(1f, 0f);
        continueRect.anchorMax = new Vector2(1f, 0f);
        continueRect.pivot = new Vector2(1f, 0f);
        continueRect.anchoredPosition = new Vector2(-Padding, Padding);
        continueRect.sizeDelta = new Vector2(260f, FooterHeight - 8f);

        _rerollButton.onClick.AddListener(HandleRerollClicked);
        _continueButton.onClick.AddListener(HandleContinueClicked);
    }

    private void OnDestroy()
    {
        if (_rerollButton != null)
        {
            _rerollButton.onClick.RemoveListener(HandleRerollClicked);
        }
        if (_continueButton != null)
        {
            _continueButton.onClick.RemoveListener(HandleContinueClicked);
        }
    }

    private void HandleHireClicked(int index)
    {
        if (_onHire != null)
        {
            _onHire.Invoke(index);
        }
    }

    private void HandleFireClicked(int index)
    {
        if (_onFire != null)
        {
            _onFire.Invoke(index);
        }
    }

    private void HandleRerollClicked()
    {
        if (_onReroll != null)
        {
            _onReroll.Invoke();
        }
    }

    private void HandleContinueClicked()
    {
        if (_onContinue != null)
        {
            _onContinue.Invoke();
        }
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

    private static Button CreateButton(string objectName, RectTransform parent, Font font, string label, out Text labelText)
    {
        GameObject child = new GameObject(objectName, typeof(RectTransform));
        RectTransform rectTransform = child.GetComponent<RectTransform>();
        rectTransform.SetParent(parent, false);
        Image image = child.AddComponent<Image>();
        image.color = new Color(0.78f, 0.69f, 0.41f, 1f);
        image.raycastTarget = true;
        Button button = child.AddComponent<Button>();
        button.targetGraphic = image;
        labelText = CreateText("Label", rectTransform, font, 18, FontStyle.Bold, TextAnchor.MiddleCenter);
        labelText.text = label;
        labelText.color = new Color(0.08f, 0.08f, 0.09f, 1f);
        RectTransform labelRect = labelText.rectTransform;
        labelRect.anchorMin = Vector2.zero;
        labelRect.anchorMax = Vector2.one;
        labelRect.offsetMin = new Vector2(6f, 4f);
        labelRect.offsetMax = new Vector2(-6f, -4f);
        return button;
    }
}
