# Modals

Pogify has a streamlined modal system. It is built with mobx and simplifies showing modals into one unified process.

## Using the Modal System

The modal system is implemented using mobx.

0. Inject the modalStore into context or use a hook
1. Define a modal component.
   - the modalStore injects a `closeModal` prop that when called will close the modal. Make sure to call it to close the modal.
   - arguments passed into closeModal will then be passed to the callback function.
2. queue it on the modal store with the `queue` method
   - queue method takes three params
     - `modal`: a jsx element
       - ie. `<Component />`
     - `timeout`: optional number
       - how long to persist the modal
       - passing `0` or undefined will keep the modal open indefinitely.
     - `callback`: optional function
       - function to call when modal is closed
       - callback will be called with the args passed in from `closeModule`
3. handle the callback

## Code Example

TODO: write a code example.
