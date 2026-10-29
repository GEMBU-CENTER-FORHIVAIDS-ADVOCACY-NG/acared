<?php

namespace App\Http\Controllers\Api;

use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryApiController
{
    public function index(Request $request): JsonResponse
    {
        $query = Category::query();

        if ($request->filled('q')) {
            $query->where('name', 'like', '%'.$request->q.'%');
        }

        if ($request->filled('filter.discount_percentage')) {
            $query->where('discount_percentage', $request->input('filter.discount_percentage'));
        }

        $sort = $request->input('sort', 'id');
        $direction = $request->input('direction', 'asc') === 'desc' ? 'desc' : 'asc';
        $query->orderBy($sort, $direction);

        $categories = $query->paginate();

        return response()->json([
            'data' => $categories->items(),
            'links' => [
                'first' => $categories->url(1),
                'last' => $categories->url($categories->lastPage()),
                'prev' => $categories->previousPageUrl(),
                'next' => $categories->nextPageUrl(),
            ],
            'meta' => [
                'current_page' => $categories->currentPage(),
                'from' => $categories->firstItem(),
                'last_page' => $categories->lastPage(),
                'per_page' => $categories->perPage(),
                'to' => $categories->lastItem(),
                'total' => $categories->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string',
            'discount_percentage' => 'required|integer|min:0|max:100',
            'description' => 'nullable|string',
        ]);

        $category = Category::create([
            'team_id' => $request->user()->currentTeam->getKey(),
            'name' => $request->name,
            'discount_percentage' => $request->discount_percentage,
            'description' => $request->description,
        ]);

        return response()->json([
            'message' => 'Successfully Create Resource',
            'data' => $category,
        ]);
    }

    public function show(Request $request, Category $category): JsonResponse
    {
        if ($category->team_id !== $request->user()->currentTeam->getKey()) {
            return response()->json([
                'message' => 'Not found.',
            ], 404);
        }

        return response()->json([
            'data' => $category,
        ]);
    }

    public function update(Request $request, Category $category): JsonResponse
    {
        if ($category->team_id !== $request->user()->currentTeam->getKey()) {
            return response()->json([
                'message' => 'Not found.',
            ], 404);
        }

        $request->validate([
            'name' => 'required|string',
            'discount_percentage' => 'required|integer|min:0|max:100',
            'description' => 'nullable|string',
        ]);

        $category->update([
            'name' => $request->name,
            'discount_percentage' => $request->discount_percentage,
            'description' => $request->description,
        ]);

        return response()->json([
            'message' => 'Successfully Update Resource',
            'data' => $category,
        ]);
    }

    public function destroy(Request $request, Category $category): JsonResponse
    {
        if ($category->team_id !== $request->user()->currentTeam->getKey()) {
            return response()->json([
                'message' => 'Not found.',
            ], 404);
        }

        $category->delete();

        return response()->json([
            'message' => 'Successfully Delete Resource',
        ]);
    }
}
