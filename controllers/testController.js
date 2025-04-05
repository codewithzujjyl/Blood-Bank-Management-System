const testController = (req, res) => {
    try {
        res.status(200).json({ success: true, message: "SUCCESS" });
    } catch (error) {
        console.error("Error in testController:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

module.exports = { testController };
