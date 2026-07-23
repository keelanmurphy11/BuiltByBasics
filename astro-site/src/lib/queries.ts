export const programsQuery = `
  *[_type == "program"] | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    summary,
    status,
    frequency,
    sessions,
    split,
    isFree,
    stripePriceId,
    topics,
    experienceLevel,
    popularityScore,
    _updatedAt
  }
`;

export const programSlugsQuery = `
  *[_type == "program" && defined(slug.current)]{
    "slug": slug.current
  }
`;

export const programBySlugQuery = `
  *[_type == "program" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    summary,
    status,
    frequency,
    sessions,
    split,
    isFree,
    stripePriceId,
    topics,
    experienceLevel,
    equipment,
    goal,
    durationWeeks,
    popularityScore,
    _updatedAt,
    faq,
    "overviewImage": overviewImage {
      "url": asset->url,
      alt,
      caption
    },
    "pdfFile": pdfFile {
      asset->{ url }
    },
    relatedResources[]->{
      _id,
      _type,
      title,
      "slug": slug.current,
      summary,
      difficulty,
      experienceLevel
    },
    days[] {
      _key,
      title,
      intro,
      guidance,
      accessories,
      slots[] {
        slotType,
        choiceLabel,
        pattern->{
          _id,
          title,
          "slug": slug.current,
          examples
        },
        choices[]->{
          _id,
          title,
          "slug": slug.current,
          examples
        }
      }
    }
  }
`;

export const movementPatternsQuery = `
  *[_type == "movementPattern"] | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    examples
  }
`;

export const articleSlugsQuery = `
  *[_type == "article" && status == "published" && defined(slug.current)]{
    "slug": slug.current
  }
`;

export const articlesQuery = `
  *[_type == "article" && status == "published"] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    summary,
    status,
    publishedAt,
    topics,
    difficulty,
    evidenceLevel,
    popularityScore,
    featured,
    featuredSlot,
    _updatedAt
  }
`;

export const libraryResourcesQuery = `
  *[_type in ["article", "program"] && (
    _type == "program" || status == "published"
  )] | order(coalesce(publishedAt, _createdAt) desc) {
    _id,
    _type,
    _updatedAt,
    title,
    "slug": slug.current,
    summary,
    topics,
    difficulty,
    experienceLevel,
    featured,
    featuredSlot,
    popularityScore,
    publishedAt,
    status,
    evidenceLevel,
    frequency,
    sessions,
    split,
    body,
    "coverImageUrl": coverImage.asset->url
  }
`;

export const articleBySlugQuery = `
  *[_type == "article" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    summary,
    status,
    publishedAt,
    _updatedAt,
    body[]{
      ...,
      _type == "image" => {
        ...,
        "url": asset->url,
        "dimensions": asset->metadata.dimensions
      }
    },
    coverImage,
    topics,
    difficulty,
    evidenceLevel,
    keyTakeaways,
    sources,
    popularityScore,
    relatedResources[]->{
      _id,
      _type,
      title,
      "slug": slug.current,
      summary,
      difficulty
    }
  }
`;
