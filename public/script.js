function comparePlantedFlowers(a, b) {
    const flowerNameA = a.flower.myFlowerName;
    const flowerNameB = b.flower.myFlowerName;
    
    // Sort on flowerName if not identical
    if (flowerNameA < flowerNameB) return -1;
    if (flowerNameA > flowerNameB) return 1;

    // If same flower, sort on packaging
    if (a.packaging < b.packaging) return -1;
    if (a.packaging > b.packaging) return 1;

    // If same flower and packaging, sort on quantity
    return a.qty - b.qty;
}