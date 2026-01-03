const supabaseModule = require('../supabase');

describe('database.uploadGoalProof gating', () => {
  it('throws if ad_shown is not true for the user', async () => {
    const storageUploadMock = jest.fn(() => ({ error: null }));
    const getPublicUrlMock = jest.fn(() => ({ data: { publicUrl: 'http://example.com/file.jpg' } }));

    const userFlagsMock = jest.fn(() => ({ single: async () => ({ data: { ad_shown: false }, error: null }) }));

    const fromMock = jest.fn((table: string) => {
      if (table === 'user_daily_flags') return { select: () => ({ eq: () => ({ eq: () => userFlagsMock() }) }) } as any;
      if (table === 'goal-proofs') return { upload: storageUploadMock } as any;
      return {} as any;
    });

    supabaseModule.supabase.from = fromMock;
    // storage simulated through supabase.storage
    supabaseModule.supabase.storage = { from: () => ({ upload: storageUploadMock, getPublicUrl: getPublicUrlMock }) };

    await expect(supabaseModule.database.uploadGoalProof('res-1', 'user-1', { fileName: 'x.jpg' } as any)).rejects.toThrow('Proof upload locked');
  });

  it('proceeds when ad_shown is true', async () => {
    const storageUploadMock = jest.fn(() => ({ error: null }));
    const getPublicUrlMock = jest.fn(() => ({ data: { publicUrl: 'http://example.com/file.jpg' } }));

    const userFlagsMock = jest.fn(() => ({ single: async () => ({ data: { ad_shown: true }, error: null }) }));
    const insertMock = jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      single: jest.fn(async () => ({ data: { id: 'proof-1' }, error: null }))
    }));

    const fromMock = jest.fn((table: string) => {
      if (table === 'user_daily_flags') return { select: () => ({ eq: () => ({ eq: () => userFlagsMock() }) }) } as any;
      if (table === 'goal-proofs') return { upload: storageUploadMock, getPublicUrl: getPublicUrlMock } as any;
      if (table === 'goal_proofs') return { insert: insertMock } as any;
      return {} as any;
    });

    supabaseModule.supabase.from = fromMock;
    supabaseModule.supabase.storage = { from: () => ({ upload: storageUploadMock, getPublicUrl: getPublicUrlMock }) };

    const res = await supabaseModule.database.uploadGoalProof('res-1', 'user-1', { fileName: 'x.jpg' } as any);
    expect(insertMock).toHaveBeenCalled();
    expect(res).toEqual({ id: 'proof-1' });
  });
});
