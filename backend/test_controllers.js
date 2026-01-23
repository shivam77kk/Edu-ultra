try {
    const col = await import('./controllers/collaborationController.js');
    console.log('Collab Controller loaded');
} catch (e) {
    console.error(e);
}
