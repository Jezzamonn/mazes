export interface Color {
    fillColor: string;
    lineColor: string;
}

export const Colors = {
    White: {
        fillColor: '#ffffff',
        lineColor: '#6e738f',
    },
    Yellow: {
        fillColor: '#fff269',
        lineColor: '#a17725',
    },
    Green: {
        fillColor: '#b2ff96',
        lineColor: '#5ba34d',
    },
    Transparent: {
        fillColor: 'rgba(255, 255, 255, 0.2)',
        lineColor: 'rgba(233, 233, 233, 0.2)',
    },
    withHue: (hue: number): Color => ({
        fillColor: `hsl(${(hue * 360).toFixed(2)}, 100%, 80%)`,
        lineColor: 'black',//`hsl(${(hue * 100).toFixed(2)}%, 100%, 50%)`,
    }),
}