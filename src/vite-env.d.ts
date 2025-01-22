/// <reference types="vite/client" />
/// <reference types="vite/client" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
interface ImportMetaEnv {
    readonly VITE_PRIVATE_KEY: deda0c0e1f5ffd9f7b8b9966fdf9b4c1da7edca970f10a118d7e3bc384226a94
    readonly VITE_API_KEY: e2acbed7ea524abcabf81c785fc371d3
    readonly VITE_COINGECKO_API_KEY: "CG-v9Vdeka9p9oWFVcLZvxMNyFd"
    readonly VITE_USDTTOKEN_ADDRESS: 0xfD4Ef88580EA4379090dA6C31585944567da5688
    readonly VITE_DAITOKEN_ADDRESS: 0x5c22ea5efC8a9BA988709aC3bb4D7f3B1c2913c5
    readonly VITE_COLLATERAL_MANAGER_ADDRESS: 0x0356F1270d409a248a0b0c44e621dC157e7c57a5
    readonly VITE_MARKETPLACE_ADDRESS: 0xd28D467B1C4259f5653A57Ae074D93B9Ea084d20
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

export default defineConfig({
  plugins: [react()],
  envPrefix: 'VITE_'
})