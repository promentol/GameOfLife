export const placePoints = async (points) => {
    try {
        const result = await fetch('/points', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                points
            })
        })
        return result.json()
    } catch (e) {
        alert("Error")
    }
}