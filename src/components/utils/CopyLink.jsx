import React, { useState } from 'react';
import NewTabLink from './NewTabLink';

import styles from "./CopyLink.module.css";
import { useRef } from 'react';


import { CopyToClipboard } from 'react-copy-to-clipboard';



export default function CopyLink({ children, className, title, ...props }) {
    const linkTitle = typeof title !== "undefined" ? title : "Click to copy and share"
    const [tooltipState, setTooltipState] = useState(false);
    const [tooltipText, setTooltipText] = useState(linkTitle);
    // const linkRef = useRef(null);
    const copiedLink = () => {
        setTooltipText("Copied!");
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
            <CopyToClipboard text={props.href} onCopy={copiedLink}>
                <NewTabLink title={linkTitle} onClick={e => e.preventDefault()} onMouseEnter={() => setTooltipState(true)} onMouseLeave={handleMouseLeave} className={`${styles.link} ${className}`} {...props}>
                    {children}
                </NewTabLink>
            </CopyToClipboard>
        </div>
    )
}
