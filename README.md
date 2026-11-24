# Sheikh Soban Fayaz | Cybersecurity Portfolio

Static portfolio hosted on GitHub Pages with automated write-up publishing via `projects.json` and GitHub Issues.

## How to Publish a New Write-Up Automatically
1. Open a new **Issue** in this repository.
2. Use the title of your write-up as the Issue title.
3. Structure the Issue body using these headings:
```markdown
### Category
network | siem | ai

### Summary
One-sentence overview of the investigation.

### Tags
SonicWall, SIEM, MITRE ATT&CK

### Scenario
Brief context of the alert or lab.

### Steps
1. Step one
2. Step two

### Snippet
source_type="sonicwall" | stats count by src_ip
```
4. Add the **`publish`** label to the Issue.
5. GitHub Actions will append the write-up to `projects.json`, commit the change, close the Issue, and trigger a GitHub Pages redeploy.
