using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class RivalLeaderboardView : MonoBehaviour
{
    private const int Padding = 18;
    private const int FullTitleFontSize = 24;
    private const int CompactTitleFontSize = 18;
    private const int FullBodyFontSize = 16;
    private const int CompactBodyFontSize = 14;
    private const int TitleHeight = 34;

    [SerializeField] private Text _titleText;
    [SerializeField] private Text _bodyText;

    private Font _font;

    public void Initialize(Font font)
    {
        _font = font;
        BuildUi();
        Hide();
    }

    public void Show()
    {
        gameObject.SetActive(true);
    }

    public void Hide()
    {
        gameObject.SetActive(false);
    }

    public void Refresh(RunState runState, bool compact)
    {
        _titleText.fontSize = compact ? CompactTitleFontSize : FullTitleFontSize;
        _bodyText.fontSize = compact ? CompactBodyFontSize : FullBodyFontSize;
        _titleText.text = compact ? "Rivals" : "Rival Leaderboard";

        if (runState == null)
        {
            _bodyText.text = "No run active.";
            return;
        }

        List<LeaderboardRow> rows = new List<LeaderboardRow>();
        rows.Add(new LeaderboardRow("You", runState.Morale, runState.Debt, CalculatePlayerPayroll(runState), "Stable", 0));

        for (int i = 0; i < runState.Rivals.Count; i++)
        {
            RivalGuildState rival = runState.Rivals[i];
            rows.Add(new LeaderboardRow(rival.DisplayName, rival.Morale, rival.Debt, rival.Payroll, rival.StatusLabel, i + 1));
        }

        SortRows(rows);

        string text = "Guild             Morale Debt Pay Status\n";
        for (int i = 0; i < rows.Count; i++)
        {
            LeaderboardRow row = rows[i];
            text += FormatName(row.Guild, compact) + "  " +
                row.Morale.ToString().PadLeft(6) + " " +
                row.Debt.ToString().PadLeft(4) + "  " +
                row.Payroll.ToString().PadLeft(3) + " " +
                row.Status + "\n";
        }

        _bodyText.text = text;
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

        background.color = new Color(0.12f, 0.13f, 0.16f, 1f);
        background.raycastTarget = false;

        _titleText = CreateText("Title", root, _font, FullTitleFontSize, FontStyle.Bold, TextAnchor.MiddleLeft);
        _bodyText = CreateText("Rows", root, _font, FullBodyFontSize, FontStyle.Normal, TextAnchor.UpperLeft);

        SetAnchoredRect(_titleText.rectTransform, 0f, 1f, 1f, 1f, Padding, -Padding - TitleHeight, -Padding, -Padding);
        SetAnchoredRect(_bodyText.rectTransform, 0f, 0f, 1f, 1f, Padding, Padding, -Padding, -Padding - TitleHeight);
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

    private static int CalculatePlayerPayroll(RunState runState)
    {
        int payroll = 0;
        for (int i = 0; i < runState.Party.Count; i++)
        {
            payroll += runState.Party[i].UpkeepThisRound;
        }

        return payroll;
    }

    private static void SortRows(List<LeaderboardRow> rows)
    {
        for (int i = 1; i < rows.Count; i++)
        {
            LeaderboardRow row = rows[i];
            int insertIndex = i - 1;
            while (insertIndex >= 0 && ShouldComeAfter(rows[insertIndex], row))
            {
                rows[insertIndex + 1] = rows[insertIndex];
                insertIndex -= 1;
            }

            rows[insertIndex + 1] = row;
        }
    }

    private static bool ShouldComeAfter(LeaderboardRow existing, LeaderboardRow candidate)
    {
        if (existing.Morale < candidate.Morale)
        {
            return true;
        }

        if (existing.Morale > candidate.Morale)
        {
            return false;
        }

        return existing.OriginalOrder > candidate.OriginalOrder;
    }

    private static string FormatName(string guild, bool compact)
    {
        int width = compact ? 12 : 16;
        if (guild.Length > width)
        {
            return guild.Substring(0, width);
        }

        return guild.PadRight(width);
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

    private class LeaderboardRow
    {
        public LeaderboardRow(string guild, int morale, int debt, int payroll, string status, int originalOrder)
        {
            Guild = guild;
            Morale = morale;
            Debt = debt;
            Payroll = payroll;
            Status = status;
            OriginalOrder = originalOrder;
        }

        public string Guild { get; }
        public int Morale { get; }
        public int Debt { get; }
        public int Payroll { get; }
        public string Status { get; }
        public int OriginalOrder { get; }
    }
}
