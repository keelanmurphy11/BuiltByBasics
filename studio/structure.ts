import type { StructureResolver } from 'sanity/structure';

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Articles')
        .schemaType('article')
        .child(S.documentTypeList('article').title('Articles')),
      S.divider(),
      S.listItem()
        .title('Programs')
        .schemaType('program')
        .child(S.documentTypeList('program').title('Programs')),
      S.listItem()
        .title('Movement Patterns')
        .schemaType('movementPattern')
        .child(S.documentTypeList('movementPattern').title('Movement Patterns')),
    ]);
