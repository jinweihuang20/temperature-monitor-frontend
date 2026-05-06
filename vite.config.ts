import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const isGithubActions = process.env.GITHUB_ACTIONS === 'true'

export default defineConfig({
  base: isGithubActions && repoName ? `/${repoName}/` : '/',
  plugins: [vue()],
})
