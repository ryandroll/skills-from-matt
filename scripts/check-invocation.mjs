#!/usr/bin/env node
// Check the invocation metadata and explicit Skill tool dependencies.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const skillsRoot = join(repo, "skills");
const errors = [];
const skills = new Map();
const markdown = [];
const counts = { "user-invoked": 0, "model-invoked": 0 };

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? walk(path) : [path];
    });
}

// Read the block-mapping fields used by this repo, without a YAML dependency.
// Other fields (including prose descriptions) are left alone. Unsupported
// syntax in a field we check is an error rather than an implicit default.
function field(source, key, file) {
  const lines = source.split(/\r?\n/);
  const matches = lines.flatMap((line, index) =>
    line.startsWith(`${key}:`) ? [index] : [],
  );
  if (matches.length > 1) throw new Error(`${file}: duplicate ${key}`);
  if (matches.length === 0) return undefined;
  const index = matches[0];
  const value = lines[index].slice(key.length + 1).trim();
  if (value && !value.startsWith("#")) return value;
  const children = [];
  for (const line of lines.slice(index + 1)) {
    if (!line.trim() || line.trimStart().startsWith("#")) continue;
    if (!/^\s/.test(line)) break;
    children.push(line);
  }
  const indent = children[0]?.match(/^ +/)?.[0].length ?? 0;
  return children.map((line) => line.slice(indent)).join("\n");
}

function boolean(value, fallback, label) {
  if (value === undefined) return fallback;
  const match = /^(true|false)(?:\s+#.*)?$/.exec(value);
  if (!match) throw new Error(`${label}: expected a YAML boolean`);
  return match[1] === "true";
}

for (const bucket of readdirSync(skillsRoot, { withFileTypes: true })) {
  if (!bucket.isDirectory() || bucket.name === "deprecated") continue;
  for (const path of walk(join(skillsRoot, bucket.name))) {
    if (!path.endsWith(".md")) continue;
    const file = relative(repo, path).split(sep).join("/");
    const source = readFileSync(path, "utf8");
    markdown.push({ file, source });
    if (!path.endsWith(`${sep}SKILL.md`)) continue;
    const directoryName = basename(dirname(path));
    let skillName = directoryName;
    try {
      const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(source)?.[1];
      if (frontmatter === undefined) throw new Error(`${file}: missing front matter`);
      const nameValue = field(frontmatter, "name", file);
      const name = /^(?:"([a-z0-9-]+)"|'([a-z0-9-]+)'|([a-z0-9-]+))(?:\s+#.*)?$/.exec(nameValue ?? "");
      if (!name) throw new Error(`${file}: missing or invalid skill name`);
      skillName = name[1] ?? name[2] ?? name[3];
      if (skillName !== directoryName) {
        errors.push(`${file}: directory name "${directoryName}" does not match front-matter name "${skillName}"`);
      }
      const userInvoked = boolean(field(frontmatter, "disable-model-invocation", file), false, `${file}: disable-model-invocation`);
      const yamlPath = join(dirname(path), "agents", "openai.yaml");
      const yamlFile = relative(repo, yamlPath);
      if (!existsSync(yamlPath)) throw new Error(`${yamlFile}: missing (every skill needs agents/openai.yaml)`);
      const yaml = readFileSync(yamlPath, "utf8");
      const policy = field(yaml, "policy", yamlFile);
      if (policy !== undefined && policy !== "" && !/^allow_implicit_invocation:/m.test(policy)) {
        throw new Error(`${yamlFile}: expected a policy block with allow_implicit_invocation`);
      }
      const implicit = boolean(field(policy ?? "", "allow_implicit_invocation", yamlFile), true, `${yamlFile}: policy.allow_implicit_invocation`);
      if (userInvoked !== !implicit) {
        errors.push(`${file}: disable-model-invocation and ${yamlFile}: policy.allow_implicit_invocation disagree`);
      }
      if (skills.has(skillName)) throw new Error(`${file}: duplicate skill name ${skillName}`);
      skills.set(skillName, { userInvoked });
      if (["engineering", "productivity"].includes(bucket.name)) {
        counts[userInvoked ? "user-invoked" : "model-invoked"]++;
      }
    } catch (error) {
      if (!skills.has(skillName)) skills.set(skillName, {});
      errors.push(error.message);
    }
  }
}

// git-workflow is an installed model-invoked skill at user scope, absent from this tree.
if (!skills.has("git-workflow")) skills.set("git-workflow", { userInvoked: false });

// Recognises with "x", twice, for "x" and "y", and backticks; unquoted names are not checked.
const calls = /\bcall(?:s|ing)?\s+the\s+Skill\s+tool\s+(?:with\s+(["'`])([^"'`]+)\1|twice,\s*for\s+(["'`])([^"'`]+)\3\s+and\s+(["'`])([^"'`]+)\5)/gi;
for (const { file, source } of markdown) {
  for (const match of source.matchAll(calls)) {
    const line = source.slice(0, match.index).split("\n").length;
    for (const name of match[2] ? [match[2]] : [match[4], match[6]]) {
      const target = skills.get(name);
      if (!target) errors.push(`${file}:${line}: Skill tool target "${name}" does not exist outside deprecated/`);
      else if (target.userInvoked) errors.push(`${file}:${line}: Skill tool target "${name}" is user-invoked`);
    }
  }
}

console.log(`Promoted skills: ${counts["user-invoked"]} user-invoked, ${counts["model-invoked"]} model-invoked`);
if (errors.length) {
  for (const error of errors) console.error(error);
  process.exitCode = 1;
} else {
  console.log("Invocation checks passed.");
}
