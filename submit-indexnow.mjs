const host = "saas-pricing-page-confidence-checklist.vercel.app";
const key = "1e5a942049c56d1ca093c6fddda56a30";
const baseUrl = `https://${host}`;
const urls = ["/", "/llms.txt", "/sitemap.xml"].map((path) => `${baseUrl}${path}`);

const endpoint = "https://api.indexnow.org/indexnow";
const payload = {
  host,
  key,
  keyLocation: `${baseUrl}/${key}.txt`,
  urlList: urls
};

const response = await fetch(endpoint, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(payload)
});

console.log(JSON.stringify({ status: response.status, urls }, null, 2));
if (!response.ok && response.status !== 202) {
  process.exitCode = 1;
}
