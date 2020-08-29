import React, { useState } from 'react';
import NewTabLink from './NewTabLink';

import styles from "./CopyLink.module.css";

export default function CopyLink({ children, className, title, ...props }) {
    const [tooltipState, setTooltipState] = useState(false);
    const [tooltipText, setTooltipText] = useState(title);
    const copyLink = (evt) => {
        evt.preventDefault();
        if (navigator.clipboard.writeText) {
            navigator.clipboard.writeText(evt.target.href);
            setTooltipText("Copied!")
        }
    }

    const handleMouseLeave = () => {
        setTooltipState(false)
        // if we replaced the helper text with "Copied!" as seen above, then replace the original text after 300ms (~the transition time)
        if (tooltipText !== title) {
            setTimeout(() => setTooltipText(title), 300)
        }
    }

    return (
        <div className={styles.wrapper}>
            <span className={`${styles.tooltip} ${tooltipState ? styles.shown : styles.hidden}`} aria-hidden>{tooltipText}</span>
            <NewTabLink title={title ? title : "Click to copy and share"} onClick={copyLink} onMouseEnter={() => setTooltipState(true)} onMouseLeave={handleMouseLeave} className={`${styles.link} ${className}`} {...props}>
                {children}
            </NewTabLink>
        </div>
    )
}
