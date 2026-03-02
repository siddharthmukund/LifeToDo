import UIKit
import Social
import MobileCoreServices
import UniformTypeIdentifiers

/// ShareViewController
/// Receives items shared into Life To Do from other apps.
///
/// On activation:
///  1. Reads text / URL from the NSExtensionItem
///  2. Writes it to the App Group shared container (group.app.lifetodo)
///  3. Opens the main app via the lifetodo:// URL scheme
///  4. Closes the extension
class ShareViewController: UIViewController {

    private let appGroupId   = "group.app.lifetodo"
    private let sharedKey    = "pendingShareItem"
    private let appScheme    = "lifetodo://share"

    override func viewDidLoad() {
        super.viewDidLoad()
        processSharedContent()
    }

    private func processSharedContent() {
        guard let extensionItem = extensionContext?.inputItems.first as? NSExtensionItem,
              let attachments   = extensionItem.attachments else {
            completeRequest()
            return
        }

        // Prefer text/plain, fall back to URL
        let textType = UTType.plainText.identifier
        let urlType  = UTType.url.identifier

        for attachment in attachments {
            if attachment.hasItemConformingToTypeIdentifier(textType) {
                attachment.loadItem(forTypeIdentifier: textType) { [weak self] item, _ in
                    let text = item as? String ?? ""
                    self?.saveAndOpen(text: text, sourceType: "text")
                }
                return
            }
            if attachment.hasItemConformingToTypeIdentifier(urlType) {
                attachment.loadItem(forTypeIdentifier: urlType) { [weak self] item, _ in
                    let url  = item as? URL
                    let text = url?.absoluteString ?? ""
                    self?.saveAndOpen(text: text, sourceType: "url")
                }
                return
            }
        }

        completeRequest()
    }

    private func saveAndOpen(text: String, sourceType: String) {
        // Write to shared container so main app can pick it up on next foreground
        if let defaults = UserDefaults(suiteName: appGroupId) {
            let payload: [String: String] = [
                "text":       text,
                "sourceType": sourceType,
                "timestamp":  ISO8601DateFormatter().string(from: Date()),
            ]
            if let data = try? JSONSerialization.data(withJSONObject: payload) {
                defaults.set(data, forKey: sharedKey)
                defaults.synchronize()
            }
        }

        // Open the main app via custom scheme
        if let url = URL(string: appScheme) {
            var responder: UIResponder? = self
            while responder != nil {
                if let app = responder as? UIApplication {
                    app.open(url, options: [:], completionHandler: nil)
                    break
                }
                responder = responder?.next
            }
        }

        completeRequest()
    }

    private func completeRequest() {
        extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
    }
}
