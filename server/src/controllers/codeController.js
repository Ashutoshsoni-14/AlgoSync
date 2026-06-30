const axios = require("axios");
const Problem = require("../models/Problem");

// Language Mapping (add here, at top)
const languageMap = {
    cpp: 54,
    python: 71,
    javascript: 63,
    java: 62
};

const encodeBase64 = (str) => {
    return Buffer.from(str || "").toString("base64");
};

const decodeBase64 = (str) => {
    return Buffer.from(str || "", "base64").toString("utf-8");
};

// Run Code
const runCode = async (req, res) => {
    try {
        const { source_code, language, stdin, problemId } = req.body;

        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({
                message: "Problem not found"
            });
        }

        const wrapper = problem.wrappers?.[language];
        if (!wrapper) {
            return res.status(400).json({
                message: `Boilerplate wrapper not found for language: ${language}`
            });
        }

        // Inject user function code into wrapper
        const fullCode = wrapper.replace("// USER_CODE", source_code);

        const response = await axios.post(
            "https://ce.judge0.com/submissions?base64_encoded=true&wait=true",
            {
                source_code: encodeBase64(fullCode),
                language_id: languageMap[language],
                stdin: encodeBase64(stdin)
            }
        );

        const data = response.data;
        if (data.stdout) data.stdout = decodeBase64(data.stdout);
        if (data.stderr) data.stderr = decodeBase64(data.stderr);
        if (data.compile_output) data.compile_output = decodeBase64(data.compile_output);

        res.status(200).json(data);

    } catch (error) {
        console.log(error.response?.data || error.message);

        res.status(500).json({
            message: error.message
        });
    }
};

// Submit Code
const submitCode = async (req, res) => {
    try {
        const {
            source_code,
            language,
            problemId
        } = req.body;

        const problem = await Problem.findById(problemId);

        if (!problem) {
            return res.status(404).json({
                message: "Problem not found"
            });
        }

        const wrapper = problem.wrappers?.[language];
        if (!wrapper) {
            return res.status(400).json({
                message: `Boilerplate wrapper not found for language: ${language}`
            });
        }

        // Inject user function code into wrapper
        const fullCode = wrapper.replace("// USER_CODE", source_code);

        let allPassed = true;

        for (const testCase of problem.hiddenTestCases) {
            const response = await axios.post(
                "https://ce.judge0.com/submissions?base64_encoded=true&wait=true",
                {
                    source_code: encodeBase64(fullCode),
                    language_id: languageMap[language],
                    stdin: encodeBase64(testCase.input)
                }
            );

            const statusId = response.data.status?.id;
            if (statusId === 6) {
                return res.status(200).json({
                    verdict: "Compilation Error",
                    compile_output: decodeBase64(response.data.compile_output || "")
                });
            }
            if (statusId >= 7 && statusId <= 12) {
                return res.status(200).json({
                    verdict: "Runtime Error",
                    stderr: decodeBase64(response.data.stderr || "")
                });
            }

            const output = decodeBase64(response.data.stdout || "").trim();

            if (output !== testCase.output.trim()) {
                allPassed = false;
                break;
            }
        }

        res.status(200).json({
            verdict: allPassed ? "Accepted" : "Wrong Answer"
        });

    } catch (error) {
        console.log(error.response?.data || error.message);

        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    runCode,
    submitCode
};