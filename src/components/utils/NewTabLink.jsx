import React, { forwardRef } from 'react'

function NewTabLink({ children, ...props }, ref) {
    return (
        <a target="_blank" rel="noopener noreferrer" ref={ref} {...props}>
            {children}
        </a>
    )
}

export default forwardRef(NewTabLink)
