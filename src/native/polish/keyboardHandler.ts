import { platform, getPlugin } from '../';

let keyboardListenersAdded = false;

/**
 * Handles Capacitor Keyboard events to adjust the DOM payload/safe area
 * dynamically when the keyboard slides up/down.
 */
export async function initKeyboardHandling(onKeyboardShow: (height: number) => void, onKeyboardHide: () => void) {
    if (!platform.isNative() || keyboardListenersAdded) return;

    const keyboard = await getPlugin<any>('keyboard');
    if (!keyboard) return;

    keyboard.addListener('keyboardWillShow', (info: { keyboardHeight: number }) => {
        onKeyboardShow(info.keyboardHeight);
    });

    keyboard.addListener('keyboardWillHide', () => {
        onKeyboardHide();
    });

    keyboardListenersAdded = true;
}
