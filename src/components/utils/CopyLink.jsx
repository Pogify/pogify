import React, { useState } from 'react';
import NewTabLink from './NewTabLink';

import styles from "./CopyLink.module.css";
import { useRef } from 'react';

function selectElementText(el) {
    var doc = window.document, sel, range;
    if (window.getSelection && doc.createRange) {
        sel = window.getSelection();
        range = doc.createRange();
        range.selectNodeContents(el);
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (doc.body.createTextRange) {
        range = doc.body.createTextRange();
        range.moveToElementText(el);
        range.select();
    }
}

export default function CopyLink({ children, className, title, ...props }) {
    const linkTitle = typeof title !== "undefined" ? title : "Click to copy and share"
    const [tooltipState, setTooltipState] = useState(false);
    const [tooltipText, setTooltipText] = useState(linkTitle);
    const linkRef = useRef(null);
    const copyLink = (evt) => {
        evt.preventDefault();
        selectElementText(linkRef.current)
        if ("clipboard" in navigator) {
            navigator.clipboard.writeText(evt.target.href);
            setTooltipText("Copied!")
        }
    }

    const handleMouseLeave = () => {
        setTooltipState(false)
        // if we replaced the helper text with "Copied!" as seen above, then replace the original text after 300ms (~the transition time)
        if (tooltipText !== linkTitle) {
            setTimeout(() => setTooltipText(linkTitle), 300)
        }
    }

    return (
        <div className={styles.wrapper}>
            <span className={`${styles.tooltip} ${tooltipState ? styles.shown : styles.hidden}`} aria-hidden>{tooltipText}</span>
            <NewTabLink title={linkTitle} onClick={copyLink} ref={linkRef} onMouseEnter={() => setTooltipState(true)} onMouseLeave={handleMouseLeave} className={`${styles.link} ${className}`} {...props}>
                {children}
            </NewTabLink>
        </div>
    )
}
