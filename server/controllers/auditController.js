import AuditLog from "../models/AuditLog.js";
import Document from "../models/Document.js";

export const getDocumentAuditLog = async (req, res) => {
  try {
    const { documentId } = req.params;

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    if (!document.owner.equals(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }

    const logs = await AuditLog.find({ document: documentId })
      .sort({ createdAt: -1 })
      .populate("user", "name email")
      .lean();

    res.json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch audit log",
      details: error.message,
    });
  }
};

export const exportAuditLog = async (req, res) => {
  try {
    const { documentId } = req.params;

    const logs = await AuditLog.find({ document: documentId })
      .populate("user", "email")
      .lean();

    const csvData = [
      ["Timestamp", "User Email", "Action", "IP Address", "Metadata"],
      ...logs.map((log) => [
        new Date(log.createdAt).toISOString(),
        log.user?.email || "External",
        log.action,
        log.ipAddress || "",
        JSON.stringify(log.metadata || {}),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    res.header("Content-Type", "text/csv");
    res.attachment(`audit-log-${documentId}.csv`);
    res.send(csvData);
  } catch (error) {
    res.status(500).json({ error: "Export failed", details: error.message });
  }
};
