import { defineStore } from 'pinia';    

export interface Pigment {
    white: number,
    red: number,
    blue: number,
    yellow: number,
    black: number,
}

export interface PigmentSwatch {
    pigments: Pigment[]
}

const WHITE: Pigment = {
    white: 1.0,
    red: 0.0,
    blue: 0.0,
    yellow: 0.0,
    black: 0.0,
}

const RED: Pigment = {
    white: 0.0,
    red: 1.0,
    blue: 0.0,
    yellow: 0.0,
    black: 0.0,
}

const BLUE: Pigment = {
    white: 0.0,
    red: 0.0,
    blue: 1.0,
    yellow: 0.0,
    black: 0.0,
}

const YELLOW: Pigment = {
    white: 0.0,
    red: 0.0,
    blue: 0.0,
    yellow: 1.0,
    black: 0.0,
}

const BLACK: Pigment = {
    white: 0.0,
    red: 0.0,
    blue: 0.0,
    yellow: 0.0,
    black: 1.0,
}


export const usePigmentStore = defineStore('pigment', {
    state: (): PigmentSwatch => ({
        pigments: [
            WHITE,
            RED,
            BLUE,
            YELLOW,
            BLACK,
        ]
    }),
    data: () => ({

    })

})
