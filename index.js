const core = require('@actions/core');
const github = require('@actions/github');
const { Octokit } = require("@octokit/rest");

const readPackageJson = function() {
    return fs.readFileSync('./package.json').toString();
}

const sRepo = github.context.repo.repo;
const sOwner = github.context.repo.owner
const sVersion = core.getInput("version") || readPackageJson();
const bDeleteOnlyDraft = core.getInput("delete-only-drafts");
const sAuthToken = core.getInput("github-access-token");

if (!sRepo) { core.error("no repository specified, aborting"); }
if (!sOwner) { core.error("no owner specified, aborting"); }
if (!sVersion) { core.error("no version specified, aborting"); }
if (!sAuthToken) { core.error("no GitHub access token specified, aborting"); }

const octokit = new Octokit({
    auth: sAuthToken,
});


const getReleaseInfos = async function(sOwner, sRepo) {
    const { data } = await octokit.request(`/repos/${sOwner}/${sRepo}/releases`);
    const oCurrentRelease = data.find(oRelease => oRelease.tag_name.includes(sVersion));
    return oCurrentRelease;
}
const run = async function() {
    const oRelease = await getReleaseInfos(sOwner, sRepo);

    // check, if only drafts should be deleted
    if (!oRelease) {
        core.error(`Could not find a release matching privided version ${sVersion}`);
    } else {
        console.log(`Found ${oRelease.tag_name} ${oRelease.name}`);
    }

    // check, if only drafts should be deleted
    if (!oRelease.draft && bDeleteOnlyDraft) {
        core.error(`Did not delete ${oRelease.tag_name} ${oRelease.name} since it's not a draft`);
    }

    const aAssets = oRelease.assets;
    console.log(`Found ${aAssets.length} assets attached to the release`);

    aAssets.forEach(async function(oAsset) {
        console.log(`Deleting ${oAsset.name}...`);
        await octokit.request({
            method: "DELETE",
            url: `/repos/${sOwner}/${sRepo}/releases/assets/${oAsset.id}`
        });
    });

    console.log("Done!");
}

try {
    console.log(readPackageJson());
    //run();
} catch (error) {
  core.setFailed(error.message);
}


