export enum Color {
    White,
    Yellow,
    Green,
    Transparent,
}

export function getFillColor(color: Color) {
    switch (color) {
        case Color.White:
            return '#ffffff';
        case Color.Yellow:
            return '#fff269';
        case Color.Green:
            return '#b2ff96';
        case Color.Transparent:
            return 'rgba(255, 255, 255, 0.2)';
    }
}

export function getLineColor(color: Color) {
    switch (color) {
        case Color.White:
            return '#6e738f';
        case Color.Yellow:
            return '#a17725';
        case Color.Green:
            return '#5ba34d';
        case Color.Transparent:
            return 'rgba(233, 233, 233, 0.2)';
    }
}