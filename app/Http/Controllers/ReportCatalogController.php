<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class ReportCatalogController extends Controller
{
    /**
     * The financial reports listed on the catalog page.
     *
     * @var list<array{key: string, title: string, description: string}>
     */
    private const FINANCIAL_REPORTS = [
        [
            'key' => 'finance',
            'title' => 'Finance summary',
            'description' => 'Revenue, discounts and payment methods over time.',
        ],
        [
            'key' => 'sales:item',
            'title' => 'Sales by item',
            'description' => 'Amount collected grouped by the item sold.',
        ],
        [
            'key' => 'sales:department',
            'title' => 'Sales by department',
            'description' => 'Amount collected grouped by department.',
        ],
        [
            'key' => 'sales:patient',
            'title' => 'Sales by patient',
            'description' => 'Amount collected grouped by patient.',
        ],
        [
            'key' => 'sales:method',
            'title' => 'Sales by payment method',
            'description' => 'Amount collected grouped by payment method.',
        ],
        [
            'key' => 'coupon-usages',
            'title' => 'Coupon usage report',
            'description' => 'Discounts redeemed from coupons and who redeemed them.',
        ],
        [
            'key' => 'discounts',
            'title' => 'Discount report',
            'description' => 'Discounts applied to patient payments by 100% and 50% percentage.',
        ],
        [
            'key' => 'wallet',
            'title' => 'Wallet report',
            'description' => 'Patient wallet balances for the selected period.',
        ],
        [
            'key' => 'price-list',
            'title' => 'Price list report',
            'description' => 'Catalogue prices, categories and availability.',
        ],
    ];

    /**
     * The clinical reports listed on the catalog page.
     *
     * @var list<array{key: string, title: string, description: string}>
     */
    private const CLINICAL_REPORTS = [
        [
            'key' => 'clinical:complaints',
            'title' => 'Complaints report',
            'description' => 'Patient complaints recorded during consultations.',
        ],
        [
            'key' => 'clinical:diagnoses',
            'title' => 'Diagnoses report',
            'description' => 'Diagnoses recorded during consultations.',
        ],
        [
            'key' => 'clinical:examinations',
            'title' => 'Examinations report',
            'description' => 'Examination findings recorded during consultations.',
        ],
    ];

    /**
     * Show the catalog of financial and clinical reports.
     */
    public function index(): Response
    {
        return Inertia::render('reports/catalog', [
            'groups' => [
                [
                    'key' => 'financial',
                    'title' => 'Financial reports',
                    'description' => 'Revenue, sales and finance operations.',
                    'reports' => self::FINANCIAL_REPORTS,
                ],
                [
                    'key' => 'clinical',
                    'title' => 'Clinical reports',
                    'description' => 'Clinical activity recorded for this team.',
                    'reports' => self::CLINICAL_REPORTS,
                ],
            ],
        ]);
    }

    /**
     * Show the catalog of financial reports.
     */
    public function financial(): Response
    {
        return Inertia::render('reports/financial/catalog', [
            'reports' => self::FINANCIAL_REPORTS,
        ]);
    }
}
