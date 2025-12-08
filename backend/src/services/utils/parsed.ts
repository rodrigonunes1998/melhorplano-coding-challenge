/**
 * Essa funcao retorna o match convertido para Number caso encontre a sequencia de digitos
 * @param speed 
 * @returns 
 */

export function parseSpeedMbps(speed: string): number {
    const match = speed.match(/\d+/);
    return match ? Number(match[0]) : 0;
}