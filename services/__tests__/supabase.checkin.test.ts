const supabaseModule = require('../supabase');

describe('database.createCheckin', () => {
  it('upserts checkin and marks daily flag for the user', async () => {
    // Mock supabase.from behavior for checkins, resolutions, and user_daily_flags
    const checkinsUpsertMock = jest.fn(() => ({ select: jest.fn().mockReturnThis(), single: jest.fn(async () => ({ data: { id: 'check-1' }, error: null })) }));
    const resolutionsSelectMock = jest.fn(() => ({ eq: jest.fn(() => ({ single: async () => ({ data: { user_id: 'user-123' }, error: null }) })) }));
    const flagsUpsertMock = jest.fn(() => ({ select: jest.fn().mockReturnThis(), single: jest.fn(async () => ({ data: { id: 'flag-1' }, error: null }) ) }));

    const fromMock = jest.fn((table: string) => {
      if (table === 'checkins') return { upsert: checkinsUpsertMock } as any;
      if (table === 'resolutions') return { select: resolutionsSelectMock } as any;
      if (table === 'user_daily_flags') return { upsert: flagsUpsertMock } as any;
      return {} as any;
    });

    // Replace the exported supabase client for the test
    supabaseModule.supabase.from = fromMock;

    const result = await supabaseModule.database.createCheckin('res-1', { execution: 'yes', energy: 4 });

    expect(checkinsUpsertMock).toHaveBeenCalled();
    expect(resolutionsSelectMock).toHaveBeenCalled();
    expect(flagsUpsertMock).toHaveBeenCalled();
    expect(result).toEqual({ id: 'check-1' });
  });
});
