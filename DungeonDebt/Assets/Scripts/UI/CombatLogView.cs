using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class CombatLogView : MonoBehaviour
{
    [SerializeField] private Text _logText;
    [SerializeField] private ScrollRect _scrollRect;
    [SerializeField] private float _lineDelaySeconds = 0.25f;

    private Coroutine _streamCoroutine;

    public bool IsStreaming
    {
        get { return _streamCoroutine != null; }
    }

    public void Initialize(Text logText, ScrollRect scrollRect)
    {
        _logText = logText;
        _scrollRect = scrollRect;
        Clear();
    }

    public void Clear()
    {
        if (_streamCoroutine != null)
        {
            StopCoroutine(_streamCoroutine);
            _streamCoroutine = null;
        }

        if (_logText != null)
        {
            _logText.text = string.Empty;
        }

        SnapToBottom();
    }

    public void StreamLines(IReadOnlyList<string> lines, Action onComplete)
    {
        Clear();
        _streamCoroutine = StartCoroutine(StreamLinesRoutine(lines, onComplete));
    }

    private IEnumerator StreamLinesRoutine(IReadOnlyList<string> lines, Action onComplete)
    {
        if (lines == null || _logText == null)
        {
            _streamCoroutine = null;
            if (onComplete != null)
            {
                onComplete();
            }

            yield break;
        }

        for (int i = 0; i < lines.Count; i++)
        {
            if (i == 0)
            {
                _logText.text = lines[i];
            }
            else
            {
                _logText.text += "\n" + lines[i];
            }

            SnapToBottom();
            yield return new WaitForSeconds(_lineDelaySeconds);
        }

        _streamCoroutine = null;
        if (onComplete != null)
        {
            onComplete();
        }
    }

    private void SnapToBottom()
    {
        if (_scrollRect == null)
        {
            return;
        }

        // Force a layout rebuild so the ScrollRect sees the new content height
        // before we snap; otherwise verticalNormalizedPosition is set against
        // last frame's size and the new tail line sits below the viewport.
        RectTransform content = _scrollRect.content;
        if (content != null)
        {
            Canvas.ForceUpdateCanvases();
            LayoutRebuilder.ForceRebuildLayoutImmediate(content);
        }

        _scrollRect.verticalNormalizedPosition = 0f;
    }
}
