# CREDENTIAL ROTATION & GIT HISTORY CLEANUP GUIDE

**Document:** CREDENTIAL_ROTATION.md  
**Severity:** CRITICAL (P0)  
**Reference Issue:** ISS-01 (Historical API Key Exposure)  

---

## 1. Summary of Exposed Credentials

During the audit, inspection of commit `b7cd267425fc5c873dd981a8c9852277bf8233eb` revealed that plaintext API tokens were previously committed to `.env.example`:

1. **Groq API Key:** `gsk_...` (Chat Completions model access)
2. **Hugging Face Token:** `hf_...` (Feature extraction model inference)
3. **GitHub Personal Access Token:** `ghp_...` (Repository query / user access)

Even though these keys were replaced with placeholder strings in later commits (`b7cd267` and `ac65042`), **Git retains full historical snapshots**. Anyone who clones the repository can inspect commit `b7cd267^` to view the original values.

---

## 2. Immediate Rotation Action Checklist (For Account Owner)

These revocations must be performed in the respective provider management consoles:

- [ ] **Groq Console:**  
  1. Visit: https://console.groq.com/keys  
  2. Locate the key created prior to May 2026.  
  3. Click **Delete / Revoke**.  
  4. Generate a new key and update your local `.env` file (do NOT commit!).

- [ ] **Hugging Face Account:**  
  1. Visit: https://huggingface.co/settings/tokens  
  2. Locate the token previously used.  
  3. Click **Delete**.  
  4. Generate a new read-only inference token and store in local `.env`.

- [ ] **GitHub Personal Access Tokens:**  
  1. Visit: https://github.com/settings/tokens  
  2. Search for the exposed token (starts with `ghp_`).  
  3. Click **Revoke**.  
  4. Generate a fine-grained token with minimal permissions (Public Repositories read-only).

---

## 3. Git History Cleanup Procedure (Requires Explicit User Authorization)

To completely expunge the credentials from the git commit history, run the following procedure using `git-filter-repo` (recommended) or `BFG Repo-Cleaner`:

### Option A: Using `git-filter-repo` (Recommended)

1. Ensure all current work is committed or stashed:
   ```bash
   git status
   ```
2. Install git-filter-repo:
   ```bash
   pip install git-filter-repo
   ```
3. Create a replacement file `replace-secrets.txt`:
   ```text
   gsk_***==>REDACTED_GROQ_KEY
   hf_***==>REDACTED_HF_TOKEN
   ghp_***==>REDACTED_GITHUB_TOKEN
   ```
4. Run the replacement across all commits:
   ```bash
   git filter-repo --replace-text replace-secrets.txt
   ```
5. Force-push the sanitized history to the remote:
   ```bash
   git push origin main --force --tags
   ```

> [!WARNING]
> Force-pushing rewrites commit SHAs. Coordinate with all collaborators before performing this operation.
