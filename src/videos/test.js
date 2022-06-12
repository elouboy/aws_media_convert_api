module.exports = async (event) => {
    console.log('event is ', event);
    return {
        statusCode: 200,
        body: JSON.stringify({ success: true, event: event })
    }
}
