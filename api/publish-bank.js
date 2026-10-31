// /api/publish-bank.js
export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { filename, code, githubToken, repoOwner, repoName } = req.body;

    if (!githubToken || !repoOwner || !repoName) {
        return res.status(400).json({ error: 'Missing GitHub configuration' });
    }

    const path = `question-banks/${filename}`;
    const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${path}`;

    try {
        // 1. Check if the file already exists to get its SHA (required for updating)
        let sha = null;
        const checkRes = await fetch(apiUrl, {
            headers: {
                'Authorization': `Bearer ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (checkRes.ok) {
            const fileData = await checkRes.json();
            sha = fileData.sha;
        }

        // 2. Encode the JS code to Base64 (GitHub API requirement)
        const contentBase64 = Buffer.from(code).toString('base64');

        // 3. Push to GitHub (Create or Update)
        const commitRes = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Update question bank: ${filename}`,
                content: contentBase64,
                sha: sha || undefined, // Include SHA if updating, omit if creating
                branch: 'main' // Change this if your branch is 'master'
            })
        });

        if (!commitRes.ok) {
            const errorData = await commitRes.json();
            throw new Error(errorData.message || 'GitHub API Error');
        }

        res.status(200).json({ success: true, message: 'Bank published to GitHub! Vercel will redeploy shortly.' });

    } catch (error) {
        console.error('Publish Error:', error);
        res.status(500).json({ error: error.message });
    }
}
