# delete-release-assets-action
A simple GitHub action which deletes all assets attached to a release. It is mainly designed to make sure electron-builder doesn't fail upon a release.

## Inputs

### `delete-only-drafts`

**Required** Should only drafts be deleted?. Default `true`.

### `github-access-token`

**Required** The GitHub access token. This is required to delete the release assets. Default ``.

### `version`
The version to delete the release assets for. If none is supplied, the package.json is read to get the version.

## Example usage

- name: Delete current release assets
  uses: Kellojo/delete-release-assets-action@v1.8
  with:
    delete-only-drafts: true
    github-access-token: ${{ secrets.github_token }}
